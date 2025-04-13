type UpdatedProducerEventData = {
  title: string;
  description: string | null;
  image: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  mode: "ONLINE" | "IN_PERSON";
  city: string | null;
  province: string | null;
  address: string | null;
  categoryId: string;
  map: string | null;
  uf: string | null;
  slug?: string;
};

type UpdatedUserEventData = {
  title: string;
  description: string | null;
  image: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  mode: "ONLINE" | "IN_PERSON";
  city: string | null;
  province: string | null;
  address: string | null;
  categoryId: string;
  uf: string | null;
  date: Date;
  slug?: string;
};
