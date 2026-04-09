import React, { useEffect, useMemo, useState } from "react";
import CurriculumContentCard from "@/features/curriculum/components/CurriculumContentCard";
import CurriculumFiltersCard from "@/features/curriculum/components/CurriculumFiltersCard";
import CurriculumYearSelectorCard from "@/features/curriculum/components/CurriculumYearSelectorCard";
import {
  fetchCurriculumCsv,
  fetchCurriculumLinks,
} from "@/features/curriculum/services/curriculumApi";
import { getPdfUrl } from "@/features/curriculum/utils/linkPaths";

export default function CurriculumTab() {
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState(null);
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [selectedNganh, setSelectedNganh] = useState("");
  const [selectedLoai, setSelectedLoai] = useState("CTDT");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forceShowCsv, setForceShowCsv] = useState(false);

  useEffect(() => {
    const loadLinks = async () => {
      setLinksLoading(true);
      setLinksError(null);

      try {
        setLinks(await fetchCurriculumLinks());
      } catch (currentError) {
        console.error("Error loading ctdt_links.json:", currentError);
        setLinksError(currentError?.message || "Không thể tải danh sách CTĐT");
        setLinks([]);
      } finally {
        setLinksLoading(false);
      }
    };

    void loadLinks();
  }, []);

  const khoaOptions = useMemo(
    () =>
      Array.from(new Set(links.map((item) => item.khoa))).sort((left, right) =>
        left.localeCompare(right, "vi")
      ),
    [links]
  );

  const nganhOptions = useMemo(
    () =>
      Array.from(
        new Set(
          links
            .filter((item) => item.khoa === selectedKhoa)
            .map((item) => item.nganh)
        )
      ).sort((left, right) => left.localeCompare(right, "vi")),
    [links, selectedKhoa]
  );

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          links
            .filter(
              (item) =>
                item.khoa === selectedKhoa &&
                item.nganh === selectedNganh &&
                item.loai === selectedLoai
            )
            .map((item) => item.nam)
        )
      ).sort((left, right) => {
        if (left.includes("Từ")) return -1;
        if (right.includes("Từ")) return 1;
        return (parseInt(right, 10) || 0) - (parseInt(left, 10) || 0);
      }),
    [links, selectedKhoa, selectedLoai, selectedNganh]
  );

  const currentLink = useMemo(
    () =>
      links.find(
        (item) =>
          item.khoa === selectedKhoa &&
          item.nganh === selectedNganh &&
          item.loai === selectedLoai &&
          item.nam === selectedYear
      ) || null,
    [links, selectedKhoa, selectedLoai, selectedNganh, selectedYear]
  );

  useEffect(() => {
    if (!selectedKhoa) return;

    if (nganhOptions.length === 0) {
      if (selectedNganh) setSelectedNganh("");
      return;
    }

    if (!nganhOptions.includes(selectedNganh)) {
      setSelectedNganh(nganhOptions[0]);
    }
  }, [nganhOptions, selectedKhoa, selectedNganh]);

  useEffect(() => {
    if (!selectedKhoa || !selectedNganh) return;

    if (yearOptions.length === 0) {
      if (selectedYear) setSelectedYear("");
      return;
    }

    if (!yearOptions.includes(selectedYear)) {
      setSelectedYear(yearOptions[0]);
    }
  }, [selectedKhoa, selectedNganh, selectedYear, yearOptions]);

  useEffect(() => {
    if (!currentLink) {
      setCsvData(null);
      setError(null);
      return;
    }

    const loadCsv = async () => {
      setLoading(true);
      setError(null);

      try {
        setCsvData(await fetchCurriculumCsv(currentLink));
      } catch (currentError) {
        console.error("Error loading CSV:", currentError);
        setError(currentError.message || "Không thể tải file CSV");
        setCsvData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCsv();
  }, [currentLink]);

  const resetSelectedData = () => {
    setError(null);
    setCsvData(null);
  };

  const handleKhoaChange = (value) => {
    setSelectedKhoa(value);
    setSelectedNganh("");
    setSelectedYear("");
    setForceShowCsv(false);
    resetSelectedData();
  };

  const handleNganhChange = (value) => {
    setSelectedNganh(value);
    setSelectedYear("");
    setForceShowCsv(false);
    resetSelectedData();
  };

  const handleLoaiChange = (value) => {
    setSelectedLoai(value);
    setSelectedYear("");
    setForceShowCsv(false);
    resetSelectedData();
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setForceShowCsv(false);
    resetSelectedData();
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-3 md:space-y-6 md:p-6">
      <CurriculumFiltersCard
        linksLoading={linksLoading}
        linksError={linksError}
        khoaOptions={khoaOptions}
        nganhOptions={nganhOptions}
        linksCount={links.length}
        selectedKhoa={selectedKhoa}
        selectedNganh={selectedNganh}
        selectedLoai={selectedLoai}
        onKhoaChange={handleKhoaChange}
        onNganhChange={handleNganhChange}
        onLoaiChange={handleLoaiChange}
      />

      <CurriculumYearSelectorCard
        selectedKhoa={selectedKhoa}
        selectedNganh={selectedNganh}
        yearOptions={yearOptions}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      <CurriculumContentCard
        selectedKhoa={selectedKhoa}
        selectedNganh={selectedNganh}
        selectedLoai={selectedLoai}
        selectedYear={selectedYear}
        csvData={csvData}
        loading={loading}
        error={error}
        yearOptions={yearOptions}
        forceShowCsv={forceShowCsv}
        pdfUrl={getPdfUrl(currentLink)}
        googleDriveLink={currentLink?.link || null}
        onShowCsv={() => setForceShowCsv(true)}
        onShowPdf={() => setForceShowCsv(false)}
      />
    </div>
  );
}
