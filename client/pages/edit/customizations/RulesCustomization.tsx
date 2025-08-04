import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Target, Plus, Trash2, Save, Edit, X, Sparkles } from "lucide-react";

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
  const [newRuleText, setNewRuleText] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [polishingRuleId, setPolishingRuleId] = useState<string | null>(null);

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
        .from("event_rules")
        .select("id, rule_text")
        .eq("event_id", eventId)
        .order("created_at");

      if (rulesError) {
        console.error("Error loading rules:", rulesError);
      } else {
        setRules(rulesData || []);
      }

      // Load rules enabled setting
      const { data: customizationData, error: customizationError } =
        await supabase
          .from("event_customization")
          .select("rules_enabled")
          .eq("event_id", eventId)
          .single();

      if (customizationError && customizationError.code !== "PGRST116") {
        console.error("Error loading customization data:", {
          message: customizationError.message,
          details: customizationError.details,
          hint: customizationError.hint,
          code: customizationError.code,
        });
      } else if (customizationData) {
        setRulesEnabled(customizationData.rules_enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading rules customization data:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error: error,
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

  const addRule = async (ruleText: string = "New rule") => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from("event_rules")
        .insert({
          event_id: eventId,
          rule_text: ruleText,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding rule:", error);
        toast({
          title: "Add Failed",
          description: "Failed to add new rule",
          variant: "destructive",
        });
      } else {
        setRules([...rules, data]);
        setNewRuleText(""); // Clear the draft text
        setEditingRuleId(data.id); // Start editing the new rule
      }
    } catch (error) {
      console.error("Error adding rule:", error);
    }
  };

  const handleNewRuleSubmit = async () => {
    if (newRuleText.trim()) {
      await addRule(newRuleText.trim());
    }
  };

  const handleNewRuleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewRuleSubmit();
    }
  };

  const updateRule = async (ruleId: string, ruleText: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from("event_rules")
        .update({ rule_text: ruleText })
        .eq("id", ruleId)
        .eq("event_id", eventId);

      if (error) {
        console.error("Error updating rule:", error);
        toast({
          title: "Update Failed",
          description: "Failed to update rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating rule:", error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from("event_rules")
        .delete()
        .eq("id", ruleId)
        .eq("event_id", eventId);

      if (error) {
        console.error("Error deleting rule:", error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete rule",
          variant: "destructive",
        });
      } else {
        setRules(rules.filter((rule) => rule.id !== ruleId));
        // Stop editing if we're deleting the rule being edited
        if (editingRuleId === ruleId) {
          setEditingRuleId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const saveRulesEnabled = async (enabled: boolean) => {
    if (!eventId) return;

    try {
      // First check if customization record exists
      const { data: existing, error: fetchError } = await supabase
        .from("event_customization")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking customization:", fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("event_customization")
          .update({ rules_enabled: enabled })
          .eq("event_id", eventId);

        if (error) {
          console.error("Error saving rules enabled:", error);
        }
      } else {
        // Create new record
        const { error } = await supabase.from("event_customization").insert({
          event_id: eventId,
          rules_enabled: enabled,
        });

        if (error) {
          console.error("Error creating customization record:", error);
        }
      }
    } catch (error) {
      console.error("Error saving rules enabled:", error);
    }
  };

  const handleSaveAll = async () => {
    if (!eventId) return;

    try {
      // Save any rule text changes (rules enabled toggle saves immediately)
      for (const [ruleId, newText] of Object.entries(ruleChanges)) {
        await updateRule(ruleId, newText);
      }

      // Clear the changes after saving
      setRuleChanges({});

      toast({
        title: "Changes Saved",
        description: "Rule changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save rule changes",
        variant: "destructive",
      });
    }
  };

  const polishRuleWithAI = async (ruleId: string) => {
    setPolishingRuleId(ruleId);

    try {
      const currentText = ruleChanges[ruleId] !== undefined ? ruleChanges[ruleId] : rules.find(r => r.id === ruleId)?.rule_text || "";

      if (!currentText.trim()) {
        toast({
          title: "No Content",
          description: "Please add some text to the rule before polishing",
          variant: "destructive",
        });
        return;
      }

      console.log(`Polishing rule with AI: ${currentText}`);

      const prompt = `Please improve and polish this golf tournament rule to make it clear, concise, and professional. Keep the core meaning the same but make it well-structured and easy to understand:

Rule:
${currentText}`;

      console.log("AI prompt:", prompt);

      // Make API call with XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log(`Rule Polish XHR Response status:`, xhr.status);
            console.log(`Rule Polish XHR Response text:`, xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error(`Rule Polish JSON parse error:`, parseError);
                reject(
                  new Error(
                    `Invalid JSON response: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    `Server error (${xhr.status}): ${errorData.error || errorData.details || "Unknown error"}`,
                  ),
                );
              } catch {
                reject(
                  new Error(
                    `HTTP ${xhr.status}: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            }
          }
        };

        xhr.onerror = function () {
          console.error(`Rule Polish XHR network error`);
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = function () {
          console.error(`Rule Polish XHR timeout`);
          reject(new Error("Request timed out"));
        };
      });

      xhr.open("POST", "/api/generate-description", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(JSON.stringify({ prompt }));

      const responseData = await responsePromise;
      console.log(`Rule Polish API response data:`, responseData);

      const polishedContent = (responseData as any)?.description;

      if (!polishedContent) {
        throw new Error("No polished content received from server");
      }

      // Update the rule with polished content
      setRuleChanges((prev) => ({
        ...prev,
        [ruleId]: polishedContent,
      }));

      toast({
        title: "Rule Polished!",
        description: "AI has improved your rule content.",
      });
    } catch (error) {
      console.error(`Error polishing rule:`, error);

      let userMessage = "There was an issue polishing the rule. Please try again later.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network") || msg.includes("fetch")) {
          userMessage = "Network error. Please check your connection and try again.";
        } else if (msg.includes("401") || msg.includes("unauthorized")) {
          userMessage = "API authorization failed. Please contact support.";
        } else if (msg.includes("server error")) {
          userMessage = error.message;
        } else if (msg.includes("json")) {
          userMessage = "AI response format error. Please try again.";
        }
      }

      toast({
        title: "Polish Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setPolishingRuleId(null);
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
                Define the tournament rules and scoring guidelines for your
                event
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
                <Label className="text-green-800 font-medium">
                  Tournament Rules
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRule()}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-3">
                {rules.map((rule, index) => {
                  const isEditing = editingRuleId === rule.id;

                  return (
                    <div key={rule.id} className="border border-green-100 rounded-lg p-4 bg-white">
                      {!isEditing ? (
                        // View mode - show rule text with edit/delete buttons
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-green-800 mb-1">
                              Rule {index + 1}
                            </div>
                            <p className="text-green-700 whitespace-pre-wrap">
                              {rule.rule_text}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                // Initialize the rule changes with current text
                                setRuleChanges((prev) => ({
                                  ...prev,
                                  [rule.id]: rule.rule_text,
                                }));
                              }}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Edit mode - show textarea with save/cancel buttons
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-green-800">
                              Edit Rule {index + 1}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRuleId(null);
                                  // Remove any unsaved changes
                                  setRuleChanges((prev) => {
                                    const { [rule.id]: removed, ...rest } = prev;
                                    return rest;
                                  });
                                }}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const newText = ruleChanges[rule.id] || rule.rule_text;
                                  await updateRule(rule.id, newText);
                                  setEditingRuleId(null);
                                  // Update the rules list with the new text
                                  setRules((prev) =>
                                    prev.map((r) =>
                                      r.id === rule.id ? { ...r, rule_text: newText } : r
                                    )
                                  );
                                  // Clear the changes
                                  setRuleChanges((prev) => {
                                    const { [rule.id]: removed, ...rest } = prev;
                                    return rest;
                                  });
                                }}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={
                              ruleChanges[rule.id] !== undefined
                                ? ruleChanges[rule.id]
                                : rule.rule_text
                            }
                            onChange={(e) => {
                              setRuleChanges((prev) => ({
                                ...prev,
                                [rule.id]: e.target.value,
                              }));
                            }}
                            onFocus={(e) => {
                              // Select all text when focusing, especially helpful for "New rule" default text
                              e.target.select();
                            }}
                            placeholder={`Rule ${index + 1}...`}
                            className="border-green-200 focus:border-emerald-500 bg-white"
                            rows={3}
                          />

                          {/* Polish with AI Button */}
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => polishRuleWithAI(rule.id)}
                              disabled={polishingRuleId === rule.id}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              {polishingRuleId === rule.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                  Polishing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Polish with AI
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {rules.length === 0 && (
                <div className="space-y-2">
                  <Textarea
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    onBlur={handleNewRuleSubmit}
                    onKeyDown={handleNewRuleKeyDown}
                    placeholder="Add a custom rule..."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={3}
                  />
                  <p className="text-sm text-green-600">
                    Start typing your first rule above, then press Enter or click outside to save
                  </p>
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
