import DashboardLayout from "../../layouts/DashboardLayout";
import "./ComingSoon.css";


function ComingSoon({ title })
{

    return (

        <DashboardLayout title={title}>

            <div className="coming-soon-card">

                <div className="coming-soon-icon">🚧</div>

                <h2>{title} is coming soon</h2>

                <p>This section isn't wired up to the backend yet — only the Dashboard and Profile pages are connected to live data right now.</p>

            </div>

        </DashboardLayout>

    );

}


export default ComingSoon;
