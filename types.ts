
export interface BiodataState {
  course: string;
  photo: string | null;
  officerName: string;
  email: string;
  qualification: string;
  field: string;
  teachingExperience: string;
  currentInstitutionExperience: string;
  courseExperience: string;
  classesTaught: { [key: string]: boolean };
}
