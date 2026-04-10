import React from "react";
import { Clock, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import { dayNames } from "../constants/searchConfig";
import { getTietTimeRange } from "../utils/searchHelpers";

function TimeResultList({ results }) {
  return (
    <div className="space-y-2">
      {results.map((item, index) => (
        <div
          key={`${item.maMonHoc}-${item.group}-${index}`}
          className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div className="mb-2 flex flex-wrap items-start gap-2">
            <Badge variant="default" className="font-mono">
              {item.maMonHoc}
            </Badge>
            <Badge variant="outline">Nhóm {item.group}</Badge>
            {item.classInfo.map((classInfo, classInfoIndex) => (
              <Badge key={classInfoIndex} variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                Tiết {classInfo.tietHoc.join("-")}
                <span className="ml-1 font-medium text-primary">
                  ({getTietTimeRange(classInfo.tietHoc)})
                </span>
                <span className="mx-1">•</span>
                <MapPin className="mr-1 h-3 w-3" />
                {classInfo.phong}
              </Badge>
            ))}
          </div>

          <div className="text-sm">
            <span className="font-medium">{item.tenMonHoc}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              <User className="mr-1 inline h-3 w-3" />
              GV: {item.giangVien}
            </span>
            {item.email && (
              <a href={`mailto:${item.email}`} className="hover:text-primary">
                <Mail className="mr-1 inline h-3 w-3" />
                {item.email}
              </a>
            )}
            <span>
              <Users className="mr-1 inline h-3 w-3" />
              {item.siso}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LookupResultList({ results }) {
  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={`${result.maMonHoc}-${index}`} className="overflow-hidden">
          <div className="flex">
            <div className="w-2 shrink-0 bg-primary" />
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-primary">{result.maMonHoc}</h4>
                  <p className="text-sm text-foreground">{result.tenMonHoc}</p>
                </div>
                {result.soTinChi > 0 && <Badge variant="secondary">{result.soTinChi} TC</Badge>}
              </div>

              <div className="space-y-3">
                {result.lichHoc.map((lichHoc, lichHocIndex) => (
                  <div
                    key={`${result.maMonHoc}-${lichHoc.group}-${lichHocIndex}`}
                    className="rounded-lg border bg-muted/20 p-3"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-bold">
                            Nhóm {lichHoc.group}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            <Users className="mr-1 inline h-3 w-3" />
                            {lichHoc.siso} SV
                          </span>
                          <span className="text-xs text-muted-foreground">{lichHoc.ngonNgu}</span>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">GV Lý thuyết: </span>
                          <span>{lichHoc.giangVien || "Chưa phân công"}</span>
                        </div>

                        {lichHoc.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${lichHoc.email}`} className="hover:text-primary">
                              {lichHoc.email}
                            </a>
                          </div>
                        )}

                        {lichHoc.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lichHoc.phone}
                          </div>
                        )}

                        {lichHoc.giangVienBT && lichHoc.giangVienBT !== lichHoc.giangVien && (
                          <div className="border-t pt-2">
                            <div className="text-sm">
                              <span className="font-medium">GV Bài tập: </span>
                              <span>{lichHoc.giangVienBT}</span>
                            </div>
                            {lichHoc.emailBT && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${lichHoc.emailBT}`} className="hover:text-primary">
                                  {lichHoc.emailBT}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium">Lịch học:</p>
                        {lichHoc.classInfo && lichHoc.classInfo.length > 0 ? (
                          <div className="space-y-1">
                            {lichHoc.classInfo.map((classInfo, classInfoIndex) => (
                              <div
                                key={classInfoIndex}
                                className="flex flex-wrap items-center gap-2 rounded bg-background px-2 py-1.5 text-sm"
                              >
                                <Badge variant="default" className="text-xs">
                                  {dayNames[classInfo.dayOfWeek] || classInfo.dayOfWeek}
                                </Badge>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Tiết {classInfo.tietHoc.join("-")}
                                  <span className="font-medium text-primary">
                                    ({getTietTimeRange(classInfo.tietHoc)})
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {classInfo.phong} ({classInfo.coSo?.trim()})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa có lịch học</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function TeachingResultList({ searchTab, filteredTimeResults, filteredSearchResults }) {
  if (searchTab === "time") {
    return <TimeResultList results={filteredTimeResults} />;
  }

  return <LookupResultList results={filteredSearchResults} />;
}
