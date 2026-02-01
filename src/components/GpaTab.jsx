import React, { useState } from "react";
import { RefreshCw, PenLine, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import GpaTabContent from "./GpaTabContent";
import ManualGpaCalculator from "./ManualGpaCalculator";

export default function GpaTab() {
  return (
    <div className="relative min-h-screen">
      <Tabs defaultValue="sync" className="w-full">
        {/* Tab Header - Non-sticky to avoid navbar conflict */}
        <div className="bg-background border-b pb-3 pt-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Tính điểm GPA</h1>
            </div>

            <TabsList className="grid w-full sm:w-auto grid-cols-2 h-10 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="sync"
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-3 sm:px-4 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync MyBK</span>
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-3 sm:px-4 transition-all"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Nhập thủ công</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <TabsContent value="sync" className="mt-0 focus-visible:outline-none">
          <GpaTabContent />
        </TabsContent>

        <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
          <div className="p-3 sm:p-6">
            <ManualGpaCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
