import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  PartyPopper,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Wand2,
  RotateCcw,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  location?: string;
  par?: number;
  yardage?: number;
  description?: string;
  image_url?: string;
  holes?: number;
}

interface AIQuickstartFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventSlug: string) => void;
}

interface QuickstartData {
  courses: string[];
  startDate: string;
  endDate: string;
  players: string[];
  occasion: string;
  theme: string;
  hasEntryFee: boolean;
  entryFeeAmount: number;
}

const OCCASIONS = [
  "Birthday",
  "Bachelor Party",
  "Annual Trip",
  "Guys Trip",
  "Family Reunion",
  "Work Trip",
  "Charity Event",
  "Tournament",
  "Celebration",
  "Weekend Getaway",
  "Other",
];

const AVAILABLE_THEMES = [
  {
    id: "GolfOS",
    name: "GolfOS",
    description:
      "Colorful, playful design with bright accents and rounded elements - perfect for casual golf trips.",
    colors: [
      "bg-gradient-to-r from-green-400 to-green-600",
      "bg-gradient-to-r from-blue-400 to-blue-600",
      "bg-gradient-to-r from-purple-400 to-orange-400",
    ],
  },
  {
    id: "TourTech",
    name: "Tour Tech",
    description:
      "Professional, enterprise-ready design with compact layout and bold orange accents for serious tournaments.",
    colors: ["bg-slate-900", "bg-slate-600", "bg-orange-600"],
  },
  {
    id: "Masters",
    name: "Masters",
    description:
      "Prestigious, traditional design inspired by Augusta National with elegant green and gold styling.",
    colors: ["bg-green-800", "bg-green-600", "bg-yellow-600"],
  },
];

export const AIQuickstartForm: React.FC<AIQuickstartFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "form" | "generating" | "complete"
  >("form");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [newPlayerInput, setNewPlayerInput] = useState("");
  const [formData, setFormData] = useState<QuickstartData>({
    courses: [],
    startDate: "",
    endDate: "",
    players: [],
    occasion: "",
    theme: "GolfOS",
    hasEntryFee: false,
    entryFeeAmount: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      console.log("Loading courses from database...");
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select(
          "id, name, location, par, yardage, description, image_url, holes",
        )
        .order("name");

      console.log("Courses query result:", { coursesData, error });

      if (error) {
        console.error("Courses query error:", error);
        throw error;
      }

      setCourses(coursesData || []);
      console.log(`Loaded ${coursesData?.length || 0} courses`);
    } catch (error) {
      console.error("Error loading courses:", error);

      let errorMessage = "Failed to load courses";
      if (error && typeof error === "object") {
        if ("message" in error) {
          errorMessage = `Failed to load courses: ${error.message}`;
        } else if ("details" in error) {
          errorMessage = `Database error: ${error.details}`;
        } else if ("hint" in error) {
          errorMessage = `Database error: ${error.hint}`;
        }
      }

      toast({
        title: "Database Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const addPlayer = () => {
    if (
      newPlayerInput.trim() &&
      !formData.players.includes(newPlayerInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        players: [...prev.players, newPlayerInput.trim()],
      }));
      setNewPlayerInput("");
    }
  };

  const removePlayer = (player: string) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p !== player),
    }));
  };

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const canSubmit = () => {
    return (
      formData.courses.length > 0 &&
      formData.startDate &&
      formData.endDate &&
      formData.players.length > 0 &&
      formData.occasion &&
      formData.theme &&
      new Date(formData.endDate) >= new Date(formData.startDate) &&
      (!formData.hasEntryFee ||
        (formData.hasEntryFee && formData.entryFeeAmount > 0))
    );
  };

  const getValidationErrors = () => {
    const errors = [];
    if (formData.courses.length === 0)
      errors.push("Select at least one course");
    if (!formData.startDate) errors.push("Select a start date");
    if (!formData.endDate) errors.push("Select an end date");
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      errors.push("End date must be after start date");
    }
    if (formData.players.length === 0) errors.push("Add at least one player");
    if (!formData.occasion) errors.push("Select an occasion");
    if (!formData.theme) errors.push("Select a theme");
    if (formData.hasEntryFee && formData.entryFeeAmount <= 0)
      errors.push("Enter a valid entry fee amount");
    return errors;
  };

  const generateEventName = async (
    occasion: string,
    courses: Course[],
    dates: { start: string; end: string },
    playerCount: number,
  ) => {
    const courseNames = courses.map((c) => c.name);
    const courseLocations = courses.map((c) => c.location).filter(Boolean);
    const startDate = new Date(dates.start).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const endDate = new Date(dates.end).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const prompt = `Generate a creative and engaging golf event name for a ${occasion.toLowerCase()} golf trip.

Event Details:
- Occasion: ${occasion}
- Dates: ${startDate} to ${endDate}, ${new Date(dates.start).getFullYear()}
- Courses: ${courseNames.join(", ")}
- Locations: ${courseLocations.length > 0 ? courseLocations.join(", ") : "Various locations"}
- Players: ${playerCount} golfers

Requirements:
- Should be catchy and memorable
- Appropriate for a ${occasion.toLowerCase()}
- Golf-themed but not overly serious
- Between 2-6 words
- No quotes or punctuation
- Consider the course names and locations for inspiration

Examples for reference:
- Birthday: "Birthday Golf Getaway"
- Bachelor Party: "Last Swing Before the Ring"
- Guys Trip: "The Boys Golf Weekend"
- Annual Trip: "Annual Golf Adventure"
- Tournament: "Championship Golf Classic"

Generate ONE event name only:`;

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate event name");
      }

      const data = await response.json();
      return data.description.trim().replace(/['"]/g, ""); // Remove any quotes
    } catch (error) {
      console.error("Error generating event name:", error);
      // Fallback to template-based generation
      const templates = {
        Birthday: ["Birthday Golf Getaway", "Golf Birthday Celebration"],
        "Bachelor Party": [
          "Bachelor Golf Weekend",
          "Last Swing Before the Ring",
        ],
        "Annual Trip": [
          "Annual Golf Adventure",
          `${new Date().getFullYear()} Golf Trip`,
        ],
        "Guys Trip": ["Guys Golf Weekend", "The Boys Golf Getaway"],
        "Family Reunion": ["Family Golf Reunion", "Family Links & Laughs"],
        "Work Trip": ["Company Golf Outing", "Team Golf Retreat"],
        Tournament: ["Golf Tournament", "Championship Golf Classic"],
        default: ["Golf Adventure", "Weekend Golf Trip"],
      };
      const names =
        templates[occasion as keyof typeof templates] || templates.default;
      return names[Math.floor(Math.random() * names.length)];
    }
  };

  const generateEventDescription = async (
    occasion: string,
    courses: Course[],
    dates: { start: string; end: string },
    playerCount: number,
    hasEntryFee: boolean,
    entryFee: number,
  ) => {
    const courseNames = courses.map((c) => c.name);
    const courseLocations = courses.map((c) => c.location).filter(Boolean);
    const startDate = new Date(dates.start).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const endDate = new Date(dates.end).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const prompt = `Write an engaging event description for a golf event with these details:

Event Type: ${occasion}
Dates: ${startDate} to ${endDate}, ${new Date(dates.start).getFullYear()}
Courses: ${courseNames.map((c) => c).join(", ")}
Locations: ${courseLocations.length > 0 ? courseLocations.join(", ") : "Multiple locations"}
Players: ${playerCount} golfers
Entry Fee: ${hasEntryFee ? `$${entryFee} per player` : "No entry fee"}
Scoring: Stableford format with skills contests

Requirements:
- Warm and inviting tone
- Mention the occasion and dates
- Reference the courses being played
- 2-3 sentences maximum
- Exciting but not overly promotional
- Include anticipation about the experience
- Professional but friendly

Write the description:`;

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate event description");
      }

      const data = await response.json();
      return data.description.trim();
    } catch (error) {
      console.error("Error generating event description:", error);
      // Fallback to template-based generation
      const coursesText =
        courses.length === 1
          ? courses[0].name
          : `${courses.length} amazing courses`;
      return `Join us for an unforgettable ${occasion.toLowerCase()} golf experience from ${startDate} to ${endDate}. We'll be playing ${coursesText} and creating memories that will last a lifetime.`;
    }
  };

  const calculatePayouts = (
    entryFee: number,
    playerCount: number,
    courseCount: number,
  ) => {
    if (!entryFee || !playerCount) return [];

    const totalPrizePool = entryFee * playerCount;
    const winnerAmount = entryFee * 2; // 200% of buy-in
    const runnerUpAmount = entryFee * 1; // 100% of buy-in

    // Remaining amount for contests: 1 long drive + 1 closest to pin per round
    const remainingAmount = totalPrizePool - winnerAmount - runnerUpAmount;
    const contestCount = courseCount * 2; // 2 contests per round
    const contestAmount = contestCount > 0 ? remainingAmount / contestCount : 0;

    const payouts = [
      {
        category: "overall_champion",
        amount: winnerAmount,
        description: "Overall Champion",
      },
      {
        category: "runner_up",
        amount: runnerUpAmount,
        description: "Runner Up",
      },
    ];

    // Add general contest prizes (not per round)
    if (contestAmount > 0) {
      payouts.push({
        category: "longest_drive",
        amount: contestAmount,
        description: "Longest Drive",
      });
      payouts.push({
        category: "closest_to_pin",
        amount: contestAmount,
        description: "Closest to Pin",
      });
    }

    return payouts;
  };

  const generateTravelInfo = async (
    occasion: string,
    courses: Course[],
    dates: { start: string; end: string },
    playerCount: number,
  ) => {
    const courseLocations = courses.map((c) => c.location).filter(Boolean);
    const primaryLocation = courseLocations[0] || "your golf destination";
    const startDate = new Date(dates.start).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const endDate = new Date(dates.end).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const prompt = `Create helpful travel information for a ${occasion.toLowerCase()} golf trip with these details:

Event: ${occasion}
Dates: ${startDate} to ${endDate}, ${new Date(dates.start).getFullYear()}
Location: ${primaryLocation}
Players: ${playerCount} golfers
Courses: ${courses.map((c) => c.name).join(", ")}

Write a "Getting There" section with:
- Travel recommendations and timing
- Transportation options (fly, drive, charter)
- Arrival timing suggestions
- Practical travel tips for golf trips
- Friendly and helpful tone

Format as markdown with headers. Keep it informative and limit response to 100 words or less:`;

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate travel info");
      }

      const data = await response.json();
      return data.description.trim();
    } catch (error) {
      console.error("Error generating travel info:", error);
      return `# Getting There\n\nYour golf adventure awaits! We recommend arriving at least one day before the first round to settle in and get excited for the golf ahead.\n\n## Transportation Options\n- **Fly:** Check nearby airports for the best deals\n- **Drive:** Perfect for bringing extra gear and snacks\n- **Charter:** Split the cost with the group for a fun ride`;
    }
  };

  const generateAccommodations = async (
    occasion: string,
    courses: Course[],
    dates: { start: string; end: string },
    playerCount: number,
  ) => {
    const courseLocations = courses.map((c) => c.location).filter(Boolean);
    const primaryLocation = courseLocations[0] || "your golf destination";

    const prompt = `Create accommodation recommendations for a ${occasion.toLowerCase()} golf trip with these details:

Event: ${occasion}
Location: ${primaryLocation}
Players: ${playerCount} golfers
Courses: ${courses.map((c) => c.name).join(", ")}

Write a "Where to Stay" section with:
- Types of accommodation options
- What to look for in golf-friendly lodging
- Group booking tips
- Budget considerations
- Location recommendations

Format as markdown with headers. Keep it helpful and practical. Limit response to 100 words or less:`;

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate accommodations");
      }

      const data = await response.json();
      return data.description.trim();
    } catch (error) {
      console.error("Error generating accommodations:", error);
      return `# Where to Stay\n\nWe've scouted some great accommodation options for your ${occasion.toLowerCase()}:\n\n## Recommended Hotels\n- Local golf resorts with course access\n- Hotels with group rates and amenities\n- Vacation rentals for larger groups\n\n*Specific recommendations will be shared based on your group size and preferences.*`;
    }
  };

  const generateDailySchedule = async (
    occasion: string,
    courses: Course[],
    dates: { start: string; end: string },
    playerCount: number,
  ) => {
    const courseNames = courses.map((c) => c.name);

    const prompt = `Create a daily schedule for a ${occasion.toLowerCase()} golf trip with these details:

Event: ${occasion}
Duration: ${courses.length} days
Players: ${playerCount} golfers
Courses: ${courseNames.join(", ")}

Write a "Daily Itinerary" section with:
- Day-by-day breakdown for each course
- Suggested timing for golf rounds
- Meal and social time recommendations
- Flexibility for weather/preferences
- Fun and appropriate tone for ${occasion.toLowerCase()}

Format as markdown with headers. Include each course as a separate day:`;

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate daily schedule");
      }

      const data = await response.json();
      return data.description.trim();
    } catch (error) {
      console.error("Error generating daily schedule:", error);
      return `# Daily Itinerary\n\n## Day-by-Day Schedule\n\n${courseNames.map((course, index) => `**Day ${index + 1}:** ${course}\n- Morning: Arrival and check-in\n- Golf: 18 holes of championship golf\n- Evening: Group dinner and stories`).join("\n\n")}\n\n*Schedule subject to weather and group preferences. Flexibility is key to a great golf trip!*`;
    }
  };

  const generateAIContent = async () => {
    setCurrentStep("generating");

    try {
      console.log("Starting AI content generation...");
      console.log("Form data:", formData);

      // Validate form data
      if (!formData.courses.length) {
        throw new Error("No courses selected");
      }
      if (!formData.startDate || !formData.endDate) {
        throw new Error("Missing start or end date");
      }
      if (!formData.players.length) {
        throw new Error("No players added");
      }
      if (!formData.occasion) {
        throw new Error("No occasion selected");
      }

      // Get selected courses data
      const selectedCourses = courses.filter((c) =>
        formData.courses.includes(c.id),
      );
      console.log("Selected courses:", selectedCourses);

      if (selectedCourses.length === 0) {
        throw new Error("Selected courses not found in database");
      }

      // Generate event data with AI
      console.log("Generating event name with AI...");
      const eventName = await generateEventName(
        formData.occasion,
        selectedCourses,
        {
          start: formData.startDate,
          end: formData.endDate,
        },
        formData.players.length,
      );

      console.log("Generating event description with AI...");
      const eventDescription = await generateEventDescription(
        formData.occasion,
        selectedCourses,
        {
          start: formData.startDate,
          end: formData.endDate,
        },
        formData.players.length,
        formData.hasEntryFee,
        formData.entryFeeAmount,
      );

      const slug =
        eventName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36);

      console.log("Generated event data:", {
        eventName,
        eventDescription,
        slug,
      });

      // Get current user for event creation
      console.log("Getting current user...");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User authentication error:", userError);
        throw new Error("You must be logged in to create events");
      }

      console.log("Current user:", user.id);

      // Create event in database
      console.log("Creating event in database...");
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          name: eventName,
          description: eventDescription,
          start_date: formData.startDate,
          end_date: formData.endDate,
          location: selectedCourses[0]?.location || "TBD",
          is_published: true,
          is_private: false,
          theme: formData.theme,
          slug: slug,
          user_id: user.id,
          buy_in: formData.hasEntryFee ? formData.entryFeeAmount : null,
        })
        .select()
        .single();

      if (eventError) {
        console.error("Event creation error:", eventError);
        throw new Error(
          `Failed to create event: ${eventError.message || JSON.stringify(eventError)}`,
        );
      }

      console.log("Event created successfully:", eventData);

      // Add courses to event
      if (selectedCourses.length > 0) {
        console.log("Adding courses to event...");
        const eventCourses = selectedCourses.map((course, index) => ({
          event_id: eventData.id,
          name: course.name,
          par: course.par || null,
          yardage: course.yardage || null,
          description: course.description || null,
          image_url: course.image_url || null,
          weather_note: null,
          display_order: index + 1,
        }));

        console.log("Event courses data:", eventCourses);

        const { error: coursesError } = await supabase
          .from("event_courses")
          .insert(eventCourses);

        if (coursesError) {
          console.error("Courses insertion error:", coursesError);
          throw new Error(
            `Failed to add courses: ${coursesError.message || JSON.stringify(coursesError)}`,
          );
        }
        console.log("Courses added successfully");

        // Create rounds with Stableford scoring for each course
        console.log("Creating rounds for each course...");
        const eventRounds = selectedCourses.map((course, index) => {
          const roundDate = new Date(formData.startDate);
          roundDate.setDate(roundDate.getDate() + index);

          return {
            event_id: eventData.id,
            course_name: course.name,
            round_date: roundDate.toISOString().split("T")[0],
            holes: 18,
            scoring_type: "stableford",
          };
        });

        const { data: createdRounds, error: roundsError } = await supabase
          .from("event_rounds")
          .insert(eventRounds)
          .select();

        if (roundsError) {
          console.error("Rounds creation error:", roundsError);
          throw new Error(
            `Failed to create rounds: ${roundsError.message || JSON.stringify(roundsError)}`,
          );
        }
        console.log("Rounds created successfully");

        // Create skills contests for each round
        if (createdRounds && createdRounds.length > 0) {
          console.log("Creating skills contests...");
          const skillsContests = [];

          createdRounds.forEach((round, roundIndex) => {
            // Add one longest drive contest (typically hole 1 or a long par 4/5)
            skillsContests.push({
              event_id: eventData.id,
              round_id: round.id, // Use actual round ID from database
              hole: 1, // Default to hole 1 for longest drive
              contest_type: "longest_drive",
            });

            // Add one closest to pin contest (typically a par 3)
            skillsContests.push({
              event_id: eventData.id,
              round_id: round.id, // Use actual round ID from database
              hole: 3, // Default to hole 3 for closest to pin
              contest_type: "closest_to_pin",
            });
          });

          const { error: skillsError } = await supabase
            .from("skills_contests")
            .insert(skillsContests);

          if (skillsError) {
            console.error("Skills contests creation error:", skillsError);
            throw new Error(
              `Failed to create skills contests: ${skillsError.message || JSON.stringify(skillsError)}`,
            );
          }
          console.log("Skills contests created successfully");
        }
      }

      // Add players to event
      if (formData.players.length > 0) {
        console.log("Adding players to event...");
        const eventPlayers = formData.players.map((playerName) => ({
          event_id: eventData.id,
          full_name: playerName,
          email: `${playerName.toLowerCase().replace(/\s+/g, ".")}@example.com`, // Placeholder email
        }));

        console.log("Event players data:", eventPlayers);

        const { error: playersError } = await supabase
          .from("event_players")
          .insert(eventPlayers);

        if (playersError) {
          console.error("Players insertion error:", playersError);
          throw new Error(
            `Failed to add players: ${playersError.message || JSON.stringify(playersError)}`,
          );
        }
        console.log("Players added successfully");
      }

      // Create prizes if there's an entry fee
      if (formData.hasEntryFee && formData.entryFeeAmount > 0) {
        console.log("Creating prize structure...");
        const payouts = calculatePayouts(
          formData.entryFeeAmount,
          formData.players.length,
          selectedCourses.length,
        );

        const { error: prizesError } = await supabase
          .from("event_prizes")
          .insert(
            payouts.map((payout) => ({
              event_id: eventData.id,
              category: payout.category,
              amount: payout.amount,
              description: payout.description,
            })),
          );

        if (prizesError) {
          console.error("Prizes creation error:", prizesError);
          throw new Error(
            `Failed to create prizes: ${prizesError.message || JSON.stringify(prizesError)}`,
          );
        }
        console.log("Prizes created successfully");
      }

      // Generate travel information with AI
      console.log("Generating travel information with AI...");

      const [flightInfo, accommodations, dailySchedule] = await Promise.all([
        generateTravelInfo(
          formData.occasion,
          selectedCourses,
          { start: formData.startDate, end: formData.endDate },
          formData.players.length,
        ),
        generateAccommodations(
          formData.occasion,
          selectedCourses,
          { start: formData.startDate, end: formData.endDate },
          formData.players.length,
        ),
        generateDailySchedule(
          formData.occasion,
          selectedCourses,
          { start: formData.startDate, end: formData.endDate },
          formData.players.length,
        ),
      ]);

      const travelData = {
        event_id: eventData.id,
        flight_info: flightInfo,
        accommodations: accommodations,
        daily_schedule: dailySchedule,
      };

      console.log("Travel data:", travelData);

      const { error: travelError } = await supabase
        .from("event_travel")
        .insert(travelData);

      if (travelError) {
        console.error("Travel insertion error:", travelError);
        throw new Error(
          `Failed to add travel information: ${travelError.message || JSON.stringify(travelError)}`,
        );
      }
      console.log("Travel information added successfully");

      setCurrentStep("complete");

      toast({
        title: "Success!",
        description: "Your golf event has been created with AI magic!",
      });

      // Redirect after a brief delay
      setTimeout(() => {
        onSuccess(eventData.slug);
      }, 1500);
    } catch (error) {
      console.error("Error generating event:", error);

      // Extract meaningful error message
      let errorMessage = "Failed to create event. Please try again.";

      if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        } else if ("details" in error && typeof error.details === "string") {
          errorMessage = error.details;
        } else if (
          "description" in error &&
          typeof error.description === "string"
        ) {
          errorMessage = error.description;
        } else {
          // Log the full error object for debugging
          console.error("Full error object:", JSON.stringify(error, null, 2));
          errorMessage = `Database error: ${JSON.stringify(error)}`;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: "Error Creating Event",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentStep("form");
    }
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      {/* Courses Selection */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>Courses to Play</span>
        </Label>
        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-500 mb-3">No courses found</div>
              <Button onClick={loadCourses} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Loading Courses
              </Button>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50"
              >
                <Checkbox
                  id={course.id}
                  checked={formData.courses.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                  className="mt-1"
                />
                <Label htmlFor={course.id} className="flex-1 cursor-pointer">
                  <div className="space-y-1">
                    <div className="font-medium">{course.name}</div>
                    {course.location && (
                      <div className="text-sm text-slate-500">
                        {course.location}
                      </div>
                    )}
                    {course.description && (
                      <div className="text-sm text-slate-600 line-clamp-2">
                        {course.description}
                      </div>
                    )}
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      {course.holes && <span>{course.holes} holes</span>}
                      {course.par && <span>Par {course.par}</span>}
                      {course.yardage && <span>{course.yardage} yards</span>}
                    </div>
                  </div>
                </Label>
                {course.image_url && (
                  <img
                    src={course.image_url}
                    alt={course.name}
                    className="w-16 h-12 rounded object-cover"
                  />
                )}
              </div>
            ))
          )}
        </div>
        {formData.courses.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-slate-600">
              Selected {formData.courses.length} course
              {formData.courses.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Start Date</span>
          </Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <Label className="text-base font-medium mb-2">End Date</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
            min={formData.startDate}
          />
        </div>
      </div>

      {/* Players */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-emerald-600" />
          <span>Players</span>
        </Label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter player name..."
              value={newPlayerInput}
              onChange={(e) => setNewPlayerInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
            />
            <Button onClick={addPlayer} disabled={!newPlayerInput.trim()}>
              Add
            </Button>
          </div>
          {formData.players.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.players.map((player) => (
                <Badge key={player} variant="secondary" className="px-3 py-1">
                  {player}
                  <button
                    onClick={() => removePlayer(player)}
                    className="ml-2 text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-2">
          <PartyPopper className="h-4 w-4 text-emerald-600" />
          <span>Occasion</span>
        </Label>
        <Select
          value={formData.occasion}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, occasion: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="What's the occasion?" />
          </SelectTrigger>
          <SelectContent>
            {OCCASIONS.map((occasion) => (
              <SelectItem key={occasion} value={occasion}>
                {occasion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme Selection */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
          <span>Event Theme</span>
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {AVAILABLE_THEMES.map((theme) => (
            <div
              key={theme.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.theme === theme.id
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, theme: theme.id }))
              }
            >
              <div className="flex items-start space-x-3">
                <div className="flex space-x-1 mt-1">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${color}`}
                    ></div>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">
                    {theme.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {theme.description}
                  </div>
                </div>
                {formData.theme === theme.id && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Fee */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
          <span>Entry Fee</span>
        </Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEntryFee"
              checked={formData.hasEntryFee}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  hasEntryFee: checked as boolean,
                  entryFeeAmount: checked ? prev.entryFeeAmount : 0,
                }))
              }
            />
            <Label htmlFor="hasEntryFee" className="cursor-pointer">
              This event has an entry fee
            </Label>
          </div>

          {formData.hasEntryFee && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="entryAmount" className="text-sm font-medium">
                Amount per player
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-slate-600">$</span>
                <Input
                  id="entryAmount"
                  type="number"
                  min="1"
                  value={formData.entryFeeAmount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      entryFeeAmount: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                  className="w-32"
                />
              </div>

              {formData.entryFeeAmount > 0 &&
                formData.players.length > 0 &&
                formData.courses.length > 0 && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <div className="font-medium mb-2">Prize Pool Preview:</div>
                    <div className="space-y-1">
                      <div>
                        Total Prize Pool: $
                        {(
                          formData.entryFeeAmount * formData.players.length
                        ).toLocaleString()}
                      </div>
                      <div>
                        Winner: $
                        {(formData.entryFeeAmount * 2).toLocaleString()} (200%
                        of buy-in)
                      </div>
                      <div>
                        Runner-up: ${formData.entryFeeAmount.toLocaleString()}{" "}
                        (100% of buy-in)
                      </div>
                      {formData.courses.length > 0 && (
                        <>
                          <div>
                            Longest Drive: $
                            {(
                              (formData.entryFeeAmount *
                                formData.players.length -
                                formData.entryFeeAmount * 3) /
                              2
                            ).toLocaleString()}
                          </div>
                          <div>
                            Closest to Pin: $
                            {(
                              (formData.entryFeeAmount *
                                formData.players.length -
                                formData.entryFeeAmount * 3) /
                              2
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            • {formData.courses.length} Longest Drive contest
                            {formData.courses.length !== 1 ? "s" : ""} (1 per
                            round)
                          </div>
                          <div className="text-xs text-slate-500">
                            • {formData.courses.length} Closest to Pin contest
                            {formData.courses.length !== 1 ? "s" : ""} (1 per
                            round)
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {!canSubmit() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">
            Please complete the following:
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {getValidationErrors().map((error, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          onClick={generateAIContent}
          disabled={!canSubmit()}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Building your event site with AI magic...
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        We're creating your event details, generating an itinerary, and setting
        up your personalized golf event site.
      </p>
      <div className="mt-6 space-y-2 text-sm text-slate-500">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Generating event name and description</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating itinerary and travel details</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 border-2 border-slate-300 rounded-full"></div>
          <span>Setting up your event site</span>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Your golf event is ready! 🎉
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        AI has generated all the details for your event. You'll be redirected to
        your new event site in just a moment.
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span>
              {currentStep === "form" && "Quick Start with AI"}
              {currentStep === "generating" && "Creating Your Event"}
              {currentStep === "complete" && "Event Created!"}
            </span>
          </DialogTitle>
          {currentStep === "form" && (
            <DialogDescription>
              Tell us a few details about your golf event and we'll generate
              everything else with AI.
            </DialogDescription>
          )}
        </DialogHeader>

        {currentStep === "form" && renderFormStep()}
        {currentStep === "generating" && renderGeneratingStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
};
