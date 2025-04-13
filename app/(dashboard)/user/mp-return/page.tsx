import { MpReturnClient } from "@/components/mp-return-client";

const MpReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { code } = await searchParams;

  const normalizedCode = Array.isArray(code) ? code[0] : code;

  return <MpReturnClient code={normalizedCode} />;
};

export default MpReturnPage;
