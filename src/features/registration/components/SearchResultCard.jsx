import React, { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import mybkApi from "@/services/mybkApi";
import ClassGroupRow from "@/features/registration/components/ClassGroupRow";

export default function SearchResultCard({ course, periodId, forceMode = false }) {
    const [expanded, setExpanded] = useState(false);
    const [classGroups, setClassGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupsError, setGroupsError] = useState(null);

    const handleClick = async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }

        setExpanded(true);
        setLoadingGroups(true);
        setGroupsError(null);

        try {
            const result = await mybkApi.getClassGroups(periodId, course.monHocId);
            if (result.success && result.data) {
                setClassGroups(result.data);
            } else {
                setGroupsError(result.error || "Không thể tải danh sách nhóm lớp");
            }
        } catch (error) {
            setGroupsError(error.message);
        } finally {
            setLoadingGroups(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-card hover:shadow-md transition-shadow border-2 border-gray-100 dark:border-gray-800">
            <CardContent className="p-3">
                <div className="flex items-center justify-between cursor-pointer" onClick={handleClick}>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{course.code}</span>
                            <Badge variant="outline" className="text-xs">
                                {course.credits} TC
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{course.name}</p>
                    </div>
                    {expanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {expanded && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        {loadingGroups && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Đang tải nhóm lớp...</span>
                            </div>
                        )}

                        {groupsError && (
                            <p className="text-sm text-red-500 py-2">{groupsError}</p>
                        )}

                        {!loadingGroups && classGroups.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                    {classGroups.length} nhóm lớp có sẵn
                                </p>
                                {classGroups.map((group, index) => (
                                    <ClassGroupRow key={index} group={group} periodId={periodId} forceMode={forceMode} />
                                ))}
                            </div>
                        )}

                        {!loadingGroups && classGroups.length === 0 && !groupsError && (
                            <p className="text-sm text-muted-foreground py-2">
                                Không có nhóm lớp nào
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
