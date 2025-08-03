import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
}

export default function DatabaseDiagnostics() {
  const [checking, setChecking] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const { toast } = useToast();

  const requiredTables = [
    'events',
    'event_rounds', 
    'event_courses',
    'event_customization',
    'event_rules',
    'event_players',
    'event_prizes'
  ];

  const checkTables = async () => {
    setChecking(true);
    const statuses: TableStatus[] = [];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        statuses.push({
          name: tableName,
          exists: !error,
          error: error?.message
        });
      } catch (error) {
        statuses.push({
          name: tableName,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTableStatuses(statuses);
    setChecking(false);

    const missingTables = statuses.filter(s => !s.exists);
    if (missingTables.length > 0) {
      toast({
        title: "Database Issues Found",
        description: `${missingTables.length} table(s) are missing or inaccessible`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Database Check Complete",
        description: "All required tables are accessible",
      });
    }
  };

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-lg text-green-900 flex items-center">
          <Database className="h-5 w-5 mr-2 text-emerald-600" />
          Database Diagnostics
        </CardTitle>
        <CardDescription className="text-green-600">
          Check if all required database tables exist and are accessible
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={checkTables}
          disabled={checking}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {checking ? "Checking..." : "Check Database Tables"}
        </Button>

        {tableStatuses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-900">Table Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tableStatuses.map((status) => (
                <div
                  key={status.name}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded"
                >
                  <span className="font-mono text-sm">{status.name}</span>
                  {status.exists ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      OK
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tableStatuses.some(s => !s.exists) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="font-semibold">Missing Tables Detected</div>
              <div className="mt-1">
                Some required database tables are missing. Please run the appropriate SQL schema scripts in your Supabase SQL Editor:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><code>event_courses_table_schema.sql</code> - For course customizations</li>
                  <li><code>event_customizations_schema.sql</code> - For customization settings</li>
                  <li><code>add_buy_in_and_skills_contests.sql</code> - For rules and skills contests</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
