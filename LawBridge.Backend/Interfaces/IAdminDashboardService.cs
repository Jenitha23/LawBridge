using LawBridge.Backend.DTOs.Dashboard;


namespace LawBridge.Backend.Interfaces;


public interface IAdminDashboardService
{

    Task<DashboardStatsDto> GetStats();

}