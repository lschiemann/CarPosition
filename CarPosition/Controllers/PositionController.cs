using CarPosition.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace CarPosition.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class PositionController : ControllerBase
  {
    private readonly ILogger<PositionController> _logger;
    private readonly PositionContext _context;

    public PositionController(ILogger<PositionController> logger, PositionContext context)
    {
      _logger = logger;
      _context = context;
    }

    [HttpGet]
    public IEnumerable<PosMsgDto> Get()
    {
      var positions = _context.PosMsgs;
      var distinctPositionsByUnits = positions.Select(p => p.Unit).Distinct().Select(u => positions.Where(p => p.Unit == u).OrderBy(p => p.GpsT).Last());
      return distinctPositionsByUnits.Select(p => new PosMsgDto()
      {
        ID = p.ID,
        Milage = p.Mil,
        Unit = p.Unit,
        Lat = p.Lat / 10000000,
        Lng = p.Lon / 10000000, //leaflet uses lng property by default
        GpsTimestamp = p.GpsT
      }).OrderBy(d => d.Unit);
    }
  }
}
