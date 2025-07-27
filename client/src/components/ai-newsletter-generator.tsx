import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sparkles, FileText, Wand2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const aiContentSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tone: z.enum(['professional', 'casual', 'friendly', 'informative']),
  length: z.enum(['short', 'medium', 'long']),
  includeHeadings: z.boolean(),
  includeSummary: z.boolean(),
  keywords: z.string().optional(),
  categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
});

type AIContentFormData = z.infer<typeof aiContentSchema>;

interface AINewsletterGeneratorProps {
  onNewsletterCreated?: (newsletterId: number) => void;
}

export default function AINewsletterGenerator({ onNewsletterCreated }: AINewsletterGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"custom" | "template">("custom");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<any>(null);

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const { data: templates } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletters/templates"],
  });

  const form = useForm<AIContentFormData>({
    resolver: zodResolver(aiContentSchema),
    defaultValues: {
      topic: "",
      tone: "professional",
      length: "medium",
      includeHeadings: true,
      includeSummary: true,
      keywords: "",
      categoryIds: [],
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: AIContentFormData) => {
      const payload = {
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
      };
      const response = await apiRequest("POST", "/api/admin/newsletters/generate", payload);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletters"] });
      toast({
        title: "Newsletter Generated!",
        description: "Your AI-powered newsletter has been created successfully.",
      });
      if (data.newsletterId && onNewsletterCreated) {
        onNewsletterCreated(data.newsletterId);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate newsletter",
        variant: "destructive",
      });
    },
  });

  const previewMutation = useMutation({
    mutationFn: async (data: { template?: string; aiConfig?: AIContentFormData }) => {
      const response = await apiRequest("POST", "/api/admin/newsletters/preview", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setPreviewContent(data);
    },
    onError: (error: any) => {
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to preview newsletter",
        variant: "destructive",
      });
    },
  });

  const onSubmitCustom = (data: AIContentFormData) => {
    generateMutation.mutate(data);
  };

  const handleTemplateGenerate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select Template",
        description: "Please select a template to generate from",
        variant: "destructive",
      });
      return;
    }

    const template = templates?.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Get category IDs that match the template categories
    const matchingCategoryIds = categories
      ?.filter(cat => template.categories.includes(cat.name))
      .map(cat => cat.id) || [];

    generateMutation.mutate({
      topic: template.name,
      tone: "professional",
      length: "medium",
      includeHeadings: true,
      includeSummary: true,
      keywords: "",
      categoryIds: matchingCategoryIds.length > 0 ? matchingCategoryIds : [categories?.[0]?.id || 1],
    });
  };

  const handlePreview = () => {
    if (activeTab === "custom") {
      const formData = form.getValues();
      previewMutation.mutate({
        aiConfig: {
          ...formData,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
        }
      });
    } else {
      previewMutation.mutate({ template: selectedTemplate });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Newsletter Generator
          </CardTitle>
          <CardDescription>
            Create professional newsletters automatically using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Content</TabsTrigger>
              <TabsTrigger value="template">From Template</TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitCustom)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Newsletter Topic</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Weekly Technology Roundup, Q4 Business Insights" 
                            {...field} 
                            data-testid="input-topic"
                          />
                        </FormControl>
                        <FormDescription>
                          What should the newsletter be about?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Writing Tone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tone">
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="informative">Informative</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Length</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-length">
                                <SelectValue placeholder="Select length" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short">Short (2-3 paragraphs)</SelectItem>
                              <SelectItem value="medium">Medium (4-5 paragraphs)</SelectItem>
                              <SelectItem value="long">Long (6+ paragraphs)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="innovation, technology, growth (comma separated)" 
                            {...field} 
                            data-testid="input-keywords"
                          />
                        </FormControl>
                        <FormDescription>
                          Keywords to include in the content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="includeHeadings"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-headings"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 font-normal">
                            Include section headings
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includeSummary"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-summary"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 font-normal">
                            Include summary
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {categories?.map((category) => (
                              <label
                                key={category.id}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={field.value.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, category.id]
                                      : field.value.filter((id) => id !== category.id);
                                    field.onChange(newValue);
                                  }}
                                  data-testid={`checkbox-category-${category.id}`}
                                />
                                <span className="text-sm">{category.name}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePreview}
                      disabled={previewMutation.isPending}
                      data-testid="button-preview"
                    >
                      {previewMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={generateMutation.isPending}
                      data-testid="button-generate"
                    >
                      {generateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Generate Newsletter
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="space-y-4">
                <FormLabel>Select Template</FormLabel>
                <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  {templates?.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={template.id} />
                          <div className="flex-1">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {template.categories.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </RadioGroup>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={!selectedTemplate || previewMutation.isPending}
                    data-testid="button-preview-template"
                  >
                    {previewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Preview
                  </Button>
                  <Button 
                    onClick={handleTemplateGenerate}
                    disabled={!selectedTemplate || generateMutation.isPending}
                    data-testid="button-generate-template"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate from Template
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {previewContent && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Title</h3>
              <p className="text-muted-foreground">{previewContent.title}</p>
            </div>
            <div>
              <h3 className="font-semibold">Subject</h3>
              <p className="text-muted-foreground">{previewContent.subject}</p>
            </div>
            <div>
              <h3 className="font-semibold">Content Preview</h3>
              <div 
                className="prose prose-sm max-w-none mt-2"
                dangerouslySetInnerHTML={{ __html: previewContent.content }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}