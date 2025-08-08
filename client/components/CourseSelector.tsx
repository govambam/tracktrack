import React, { useState, useEffect, useRef } from "react";
import { Course } from "@/contexts/TripCreationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MapPin,
  Globe,
  Phone,
  Target,
  CheckCircle,
  X,
} from "lucide-react";

interface CourseSelectorProps {
  selectedCourses: Course[]; // Array of selected courses
  onCoursesChange: (courses: Course[]) => void; // Callback when selection changes
  onCourseCreate?: (
    courseData: Omit<Course, "id">,
  ) => Promise<{ success: boolean; course?: Course; error?: string }>;
  searchCourses: (query: string) => Promise<Course[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CourseSelector({
  selectedCourses,
  onCoursesChange,
  onCourseCreate,
  searchCourses,
  placeholder = "Search for golf courses by name or location...",
  className = "",
  disabled = false,
}: CourseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    location: "",
    par: 72,
    yardage: 6800,
    holes: 18,
    description: "",
    image_url: "",
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search courses with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCourses(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching courses:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchCourses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.find((c) => c.id === course.id);
    let newSelection: Course[];

    if (isSelected) {
      // Remove from selection
      newSelection = selectedCourses.filter((c) => c.id !== course.id);
    } else {
      // Add to selection
      newSelection = [...selectedCourses, course];
    }

    onCoursesChange(newSelection);
    // Keep the dropdown open for multi-select
  };

  const handleManualCourseAdd = () => {
    if (searchQuery.trim()) {
      // Create a temporary course object for manual entry
      const tempCourse: Course = {
        id: `temp-${Date.now()}`,
        name: searchQuery.trim(),
        holes: 18,
        is_official: false,
      };

      const newSelection = [...selectedCourses, tempCourse];
      onCoursesChange(newSelection);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!onCourseCreate || !createForm.name.trim()) return;

    setIsCreating(true);
    try {
      const result = await onCourseCreate({
        name: createForm.name.trim(),
        location: createForm.location.trim() || undefined,
        par: createForm.par || undefined,
        yardage: createForm.yardage || undefined,
        holes: createForm.holes,
        description: createForm.description.trim() || undefined,
        image_url: createForm.image_url.trim() || undefined,
        is_official: false,
      });

      if (result.success && result.course) {
        // Add the new course to selection
        const newSelection = [...selectedCourses, result.course];
        onCoursesChange(newSelection);
        setShowCreateDialog(false);
        setSearchQuery("");
        setCreateForm({
          name: "",
          location: "",
          par: 72,
          yardage: 6800,
          holes: 18,
          description: "",
          image_url: "",
        });
      } else {
        console.error("Failed to create course:", result.error);
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const displayValue =
    searchQuery ||
    (selectedCourses.length > 0
      ? `${selectedCourses.length} course${selectedCourses.length !== 1 ? "s" : ""} selected`
      : "");

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Input
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && searchQuery.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto border shadow-lg">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                Searching courses...
              </div>
            ) : (
              <>
                {searchResults.length > 0 && (
                  <div className="border-b">
                    <div className="p-2 text-xs font-medium text-gray-600 bg-gray-50">
                      Found Courses (Click to select/deselect)
                    </div>
                    {searchResults.map((course) => {
                      const isSelected = selectedCourses.find(
                        (c) => c.id === course.id,
                      );
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleCourseToggle(course)}
                          className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? "bg-emerald-50 border-emerald-200" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={!!isSelected}
                              onChange={() => {}} // Controlled by parent click
                              className="mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {course.name}
                                  </span>
                                  {course.is_official && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Official
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {course.location && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{course.location}</span>
                                </div>
                              )}
                              {course.description && (
                                <div className="text-sm text-gray-600 line-clamp-2">
                                  {course.description}
                                </div>
                              )}
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {course.holes && (
                                  <span>{course.holes} holes</span>
                                )}
                                {course.par && <span>Par {course.par}</span>}
                                {course.yardage && (
                                  <span>{course.yardage} yards</span>
                                )}
                              </div>
                            </div>
                            {course.image_url && (
                              <img
                                src={course.image_url}
                                alt={course.name}
                                className="w-16 h-12 rounded object-cover flex-shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-2 border-t bg-gray-50">
                  <div className="space-y-2">
                    <button
                      onClick={handleManualCourseAdd}
                      className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Target className="h-4 w-4" />
                      <span>Add "{searchQuery}" as course name</span>
                    </button>
                    {onCourseCreate && (
                      <button
                        onClick={() => {
                          setCreateForm({ ...createForm, name: searchQuery });
                          setShowCreateDialog(true);
                          setIsOpen(false);
                        }}
                        className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create new course "{searchQuery}"</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Golf Course</DialogTitle>
            <DialogDescription>
              Add course details to our database. This course will be available
              for future events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="course-name">Course Name *</Label>
              <Input
                id="course-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                placeholder="Enter course name"
              />
            </div>

            <div>
              <Label htmlFor="course-location">Location</Label>
              <Input
                id="course-location"
                value={createForm.location}
                onChange={(e) =>
                  setCreateForm({ ...createForm, location: e.target.value })
                }
                placeholder="City, State/Country"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="course-holes">Holes</Label>
                <Input
                  id="course-holes"
                  type="number"
                  min="9"
                  max="36"
                  value={createForm.holes}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      holes: parseInt(e.target.value) || 18,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="course-par">Total Par</Label>
                <Input
                  id="course-par"
                  type="number"
                  min="27"
                  max="108"
                  value={createForm.par}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      par: parseInt(e.target.value) || 72,
                    })
                  }
                  placeholder="72"
                />
              </div>
              <div>
                <Label htmlFor="course-yardage">Yardage</Label>
                <Input
                  id="course-yardage"
                  type="number"
                  min="1000"
                  max="9000"
                  value={createForm.yardage}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      yardage: parseInt(e.target.value) || 6800,
                    })
                  }
                  placeholder="6800"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="course-image">Image URL</Label>
              <Input
                id="course-image"
                type="url"
                value={createForm.image_url}
                onChange={(e) =>
                  setCreateForm({ ...createForm, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="course-description">Description</Label>
              <Input
                id="course-description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Brief course description (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={!createForm.name.trim() || isCreating}
            >
              {isCreating ? "Adding..." : "Add Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
