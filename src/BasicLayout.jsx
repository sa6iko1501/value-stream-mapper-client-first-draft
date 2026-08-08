import { Outlet } from "react-router";
import NavBar from './reusable-components/navbar/NavBar';
import Footer from "./reusable-components/footer/Footer";

function BasicLayout() {
    return (
        <>
            <NavBar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default BasicLayout;