import './NavBar.css'
import { Link } from 'react-router'

function NavBar() {
    return (
        <nav className="navbar">
            <Link className="navbar-link" to="/" className="navbar-logo">
                <img src="src\assets\Icon_Transparent.png" alt="Logo" />
            </Link>
            <ul>
                <li>
                    <Link className="navbar-link" to="/dashboards">
                        <div className='navbar-item'>
                            <p>
                                Dashboards
                            </p>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link className="navbar-link" to="/value-stream-maps">
                        <div className='navbar-item'>
                            <p>
                                VS Maps
                            </p>
                        </div>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;