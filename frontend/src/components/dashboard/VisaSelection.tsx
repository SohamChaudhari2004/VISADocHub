import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Plane, BookOpen } from "lucide-react";

export interface VisaTypeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const VISA_TYPES: VisaTypeInfo[] = [
  {
    id: "F-1",
    name: "F-1 Student Visa",
    description: "For academic students entering the US.",
    icon: <GraduationCap className="h-6 w-6 text-blue-500" />,
  },
  {
    id: "H-1B",
    name: "H-1B Work Visa",
    description: "For temporary workers in specialty occupations.",
    icon: <Briefcase className="h-6 w-6 text-purple-500" />,
  },
  {
    id: "B-1/B-2",
    name: "B-1/B-2 Tourist/Business",
    description: "For temporary business or tourism.",
    icon: <Plane className="h-6 w-6 text-green-500" />,
  },
  {
    id: "J-1",
    name: "J-1 Exchange Visitor",
    description: "For exchange visitors.",
    icon: <BookOpen className="h-6 w-6 text-orange-500" />,
  },
];

interface VisaSelectionProps {
  onSelect: (visaId: string) => void;
}

export function VisaSelection({ onSelect }: VisaSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Select Visa Type</h2>
        <p className="mt-4 text-lg/8 text-zinc-400">
          Choose the US visa you are applying for to see the required documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VISA_TYPES.map((visa) => (
          <Card 
            key={visa.id} 
            className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
            onClick={() => onSelect(visa.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                  {visa.icon}
                </div>
                <div>
                  <CardTitle className="text-xl text-zinc-100">{visa.name}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">{visa.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mt-4" onClick={(e) => { e.stopPropagation(); onSelect(visa.id); }}>
                Start Application
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
