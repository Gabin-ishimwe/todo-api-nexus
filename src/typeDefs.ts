export type Category = {
  id: number;
  name: string;
  task?: Task[];
};

export type Task = {
  id: number;
  title: string;
  description: string;
  categoryId: number;
};
