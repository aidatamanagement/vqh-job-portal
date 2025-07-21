
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EmailTemplate } from '@/types';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching templates...');

      const { data, error, count } = await supabase
        .from('email_templates')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error, count });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No data returned from Supabase');
        setTemplates([]);
        return;
      }

      console.log(`Found ${data.length} templates:`, data);
      
      // Transform the data to match our EmailTemplate interface
      const transformedTemplates: EmailTemplate[] = data.map(template => ({
        id: template.id,
        slug: template.slug,
        name: template.name,
        subject: template.subject,
        html_body: template.html_body,
        variables: (template.variables as string[]) || [],
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at
      }));
      
      setTemplates(transformedTemplates);
      console.log('Templates set successfully:', transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      const errorMessage = error.message || 'Failed to load email templates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating template:', template);
      
      // Validate slug format (alphanumeric and underscores only)
      const slugRegex = /^[a-zA-Z0-9_]+$/;
      if (!slugRegex.test(template.slug)) {
        throw new Error('Slug can only contain letters, numbers, and underscores');
      }

      // Check if slug is unique
      const { data: existingTemplates, error: checkError } = await supabase
        .from('email_templates')
        .select('id, slug')
        .eq('slug', template.slug);

      if (checkError) throw checkError;

      if (existingTemplates && existingTemplates.length > 0) {
        throw new Error('A template with this slug already exists');
      }
      
      const { error } = await supabase
        .from('email_templates')
        .insert({
          slug: template.slug,
          name: template.name,
          subject: template.subject,
          html_body: template.html_body,
          variables: template.variables,
          is_active: template.is_active
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template created successfully",
      });

      fetchTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create email template",
        variant: "destructive",
      });
    }
  };

  const updateTemplate = async (template: EmailTemplate) => {
    try {
      // Validate slug format (alphanumeric and underscores only)
      const slugRegex = /^[a-zA-Z0-9_]+$/;
      if (!slugRegex.test(template.slug)) {
        throw new Error('Slug can only contain letters, numbers, and underscores');
      }

      // Check if slug is unique (excluding current template)
      const { data: existingTemplates, error: checkError } = await supabase
        .from('email_templates')
        .select('id, slug')
        .eq('slug', template.slug)
        .neq('id', template.id);

      if (checkError) throw checkError;

      if (existingTemplates && existingTemplates.length > 0) {
        throw new Error('A template with this slug already exists');
      }

      const { error } = await supabase
        .from('email_templates')
        .update({
          slug: template.slug,
          name: template.name,
          subject: template.subject,
          html_body: template.html_body,
          is_active: template.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template updated successfully",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    updateTemplate,
    createTemplate
  };
};
