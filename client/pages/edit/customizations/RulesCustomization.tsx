import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Target, Plus, Trash2, Save } from "lucide-react";

interface EventRule {
  id: string;
  rule_text: string;
}

export default function RulesCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [rules, setRules] = useState<EventRule[]>([]);
  const [rulesEnabled, setRulesEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ruleChanges, setRuleChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventId) {
      loadRulesData();
    }
  }, [eventId]);

  const loadRulesData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load rules from event_rules table
      const { data: rulesData, error: rulesError } = await supabase
        .from('event_rules')
        .select('id, rule_text')
        .eq('event_id', eventId)
        .order('created_at');

      if (rulesError) {
        console.error('Error loading rules:', rulesError);
      } else {
        setRules(rulesData || []);
      }

      // Load rules enabled setting
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('rules_enabled')
        .eq('event_id', eventId)
        .single();

      if (customizationError && customizationError.code !== 'PGRST116') {
        console.error('Error loading customization data:', {
          message: customizationError.message,
          details: customizationError.details,
          hint: customizationError.hint,
          code: customizationError.code
        });
      } else if (customizationData) {
        setRulesEnabled(customizationData.rules_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading rules customization data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      toast({
        title: "Load Failed",
        description: "Failed to load rules customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_rules')
        .insert({ 
          event_id: eventId, 
          rule_text: 'New rule' 
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding rule:', error);
        toast({
          title: "Add Failed",
          description: "Failed to add new rule",
          variant: "destructive",
        });
      } else {
        setRules([...rules, data]);
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const updateRule = async (ruleId: string, ruleText: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from('event_rules')
        .update({ rule_text: ruleText })
        .eq('id', ruleId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error updating rule:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from('event_rules')
        .delete()
        .eq('id', ruleId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error deleting rule:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete rule",
          variant: "destructive",
        });
      } else {
        setRules(rules.filter(rule => rule.id !== ruleId));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const saveRulesEnabled = async (enabled: boolean) => {
    if (!eventId) return;

    try {
      // First check if customization record exists
      const { data: existing, error: fetchError } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking customization:', fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('event_customization')
          .update({ rules_enabled: enabled })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving rules enabled:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            rules_enabled: enabled
          });

        if (error) {
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving rules enabled:', error);
    }
  };

  const handleSaveAll = async () => {
    if (!eventId) return;

    try {
      // Save rules enabled setting
      await saveRulesEnabled(rulesEnabled);

      toast({
        title: "Settings Saved",
        description: "Rules customization settings have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save rules settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-emerald-600" />
                Scoring & Rules
              </CardTitle>
              <CardDescription className="text-green-600">
                Define the tournament rules and scoring guidelines for your event
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="rules-toggle" className="text-sm text-green-700">
                Enable Rules Page
              </Label>
              <Switch
                id="rules-toggle"
                checked={rulesEnabled}
                onCheckedChange={(checked) => {
                  setRulesEnabled(checked);
                  saveRulesEnabled(checked);
                }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-green-800 font-medium">Tournament Rules</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRule}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  disabled={!rulesEnabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={ruleChanges[rule.id] !== undefined ? ruleChanges[rule.id] : rule.rule_text}
                        onChange={(e) => {
                          setRuleChanges(prev => ({ ...prev, [rule.id]: e.target.value }));
                        }}

                        placeholder={`Rule ${index + 1}...`}
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        rows={2}
                        disabled={!rulesEnabled}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={!rulesEnabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {rules.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No rules added yet. Click "Add Rule" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
