const normalizeFileNamePart = (text) =>
  text
    .trim()
    .replace(/[():]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "_");

const normalizeFolderName = (text) =>
  text
    .trim()
    .replace(/[():]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function getCsvPath(linkItem) {
  if (!linkItem) return null;

  const csvFilename =
    [
      normalizeFileNamePart(linkItem.khoa),
      normalizeFileNamePart(linkItem.nganh),
      linkItem.loai,
      normalizeFileNamePart(linkItem.nam),
      linkItem.file_id,
    ].join("_") + ".csv";

  const folderType =
    linkItem.loai === "CTDT" ? "Organized_CTDT" : "Organized_KHGD";
  const khoaFolder = normalizeFolderName(linkItem.khoa);
  const nganhFolder = normalizeFolderName(linkItem.nganh);

  return `/CTDT/${folderType}/${encodeURIComponent(khoaFolder)}/${encodeURIComponent(nganhFolder)}/${encodeURIComponent(csvFilename)}`;
}

export function getPdfUrl(linkItem) {
  if (!linkItem) return null;

  return `/CTDT/PDFs/${[
    normalizeFileNamePart(linkItem.khoa),
    normalizeFileNamePart(linkItem.nganh),
    linkItem.loai,
    normalizeFileNamePart(linkItem.nam),
    linkItem.file_id,
  ].join("_")}.pdf`;
}
