import React, { useState, useEffect, useRef } from "react";
import { Course } from "@/contexts/TripCreationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  value?: string; // courseId
  courseName?: string; // for backward compatibility
  onCourseSelect: (course: Course | null, courseName?: string) => void;
  onCourseCreate?: (courseData: Omit<Course, "id">) => Promise<{ success: boolean; course?: Course; error?: string }>;
  searchCourses: (query: string) => Promise<Course[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CourseSelector({
  value,
  courseName,
  onCourseSelect,
  onCourseCreate,
  searchCourses,
  placeholder = "Search for a golf course...",
  className = "",
  disabled = false,
}: CourseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

  // Initialize with current course name for backward compatibility
  useEffect(() => {
    if (courseName && !value) {
      setSearchQuery(courseName);
    }
  }, [courseName, value]);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSearchQuery(course.name);
    setIsOpen(false);
    onCourseSelect(course);
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
        handleCourseSelect(result.course);
        setShowCreateDialog(false);
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

  const handleManualEntry = () => {
    setSelectedCourse(null);
    setIsOpen(false);
    onCourseSelect(null, searchQuery);
  };

  const displayValue = selectedCourse?.name || searchQuery || "";

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Input
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            if (selectedCourse) {
              setSelectedCourse(null);
              onCourseSelect(null, e.target.value);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {selectedCourse && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {isOpen && searchQuery.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border shadow-lg">
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
                      Found Courses
                    </div>
                    {searchResults.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseSelect(course)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{course.name}</span>
                            {course.is_official && (
                              <Badge variant="secondary" className="text-xs">
                                Official
                              </Badge>
                            )}
                          </div>
                          {course.location && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{course.location}</span>
                            </div>
                          )}
                          {course.total_holes && course.total_par && (
                            <div className="text-xs text-gray-400 mt-1">
                              {course.total_holes} holes • Par {course.total_par}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-2 border-t bg-gray-50">
                  <div className="space-y-2">
                    <button
                      onClick={handleManualEntry}
                      className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Target className="h-4 w-4" />
                      <span>Use "{searchQuery}" as course name</span>
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
                        <span>Add "{searchQuery}" as new course</span>
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
              Add course details to our database. This course will be available for future events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="course-name">Course Name *</Label>
              <Input
                id="course-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Enter course name"
              />
            </div>

            <div>
              <Label htmlFor="course-location">Location</Label>
              <Input
                id="course-location"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="City, State/Country"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="course-holes">Total Holes</Label>
                <Input
                  id="course-holes"
                  type="number"
                  min="9"
                  max="36"
                  value={createForm.total_holes}
                  onChange={(e) => setCreateForm({ ...createForm, total_holes: parseInt(e.target.value) || 18 })}
                />
              </div>
              <div>
                <Label htmlFor="course-phone">Phone</Label>
                <Input
                  id="course-phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="course-website">Website</Label>
              <Input
                id="course-website"
                type="url"
                value={createForm.website_url}
                onChange={(e) => setCreateForm({ ...createForm, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="course-description">Description</Label>
              <Input
                id="course-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
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
