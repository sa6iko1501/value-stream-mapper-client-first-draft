import './Footer.css'

function Footer() {
    return (
        <div className="footer">
            <p>Value-Stream Mapper</p>
            <p>Aleksandar Aleksandrov Stoyanov</p>
            <div className='github-info-container'>
                <a href="https://github.com/sa6iko1501" target="_blank">
                    <img src="src\assets\github-logo.png"></img>
                    <p>Check me out!</p>
                </a>
            </div>
        </div>
    );
}

export default Footer;