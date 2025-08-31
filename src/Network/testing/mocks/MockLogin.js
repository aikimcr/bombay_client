export const mockLoginStatus = jest.fn();
export const mockRefreshToken = jest.fn();
export const mockLogin = jest.fn();
export const mockLogout = jest.fn();

export const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

export const decodedTestToken = {
  sub: "FDC81138",
  user: { id: 1, name: "admin", admin: false },
  iat: 0,
};
