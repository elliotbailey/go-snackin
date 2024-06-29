import './Default.css';
import { FaRegSmileBeam } from "react-icons/fa";

function Default() {
    return(
        <div className='wrap'>
            <h2 className='header'>
                WELCOME
                <FaRegSmileBeam className='icon' />
            </h2>
        </div>
    );
}

export default Default