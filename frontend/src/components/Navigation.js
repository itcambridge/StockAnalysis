import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Navigation.css';

function Navigation({ user }) {
    const handleSignOut = () => {
        console.log('Signing out...');
    };

    return (
        <nav className="navigation">
            <div className="nav-left">
                <Link to="/" className="nav-link">Stock Analysis</Link>
                <Link to="/portfolio" className="nav-link">Portfolio</Link>
            </div>
            <div className="nav-right">
                <span className="welcome-text">Welcome, {user?.name || 'Guest'}!</span>
                <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
            </div>
        </nav>
    );
}

Navigation.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string
    })
};

Navigation.defaultProps = {
    user: {
        name: 'Guest',
        email: ''
    }
};

export default Navigation; 