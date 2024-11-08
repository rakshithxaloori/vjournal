import Box from "@mui/material/Box";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const Layout = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Header />
    <main style={{ minHeight: "100vh", margin: "20px", marginTop: "20px" }}>
      {children}
    </main>
    <Footer />
  </Box>
);

export default Layout;
