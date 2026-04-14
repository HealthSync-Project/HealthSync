type RouteAccessProps = {
  [key: string]: string[];
};

export const routeAccess: RouteAccessProps = {
  "/admin": ["admin"],
  "/admin(.*)": ["admin"],
  "/patient": ["patient", "admin", "doctor", "nurse"],
  "/patient(.*)": ["patient", "admin", "doctor", "nurse"],
  "/doctor": ["doctor"],
  "/doctor(.*)": ["doctor"],
  "/staff": ["nurse", "lab_technician", "cashier"],
  "/staff(.*)": ["nurse", "lab_technician", "cashier"],
  "/record/users": ["admin"],
  "/record/doctors": ["admin"],
  "/record/doctors(.*)": ["admin", "doctor"],
  "/record/staffs": ["admin", "doctor"],
  "/record/patients": ["admin", "doctor", "nurse"],
  "/patient/registrations": ["patient"],
};