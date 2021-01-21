using System;
using System.ComponentModel.DataAnnotations;

namespace CarPosition.Model
{
  public class PosMsg
  {
    [Key]
    public int ID { get; set; }
    public float Alt { get; set; }
    public float Dir { get; set; }
    public bool Distress { get; set; }
    public bool Door { get; set; }
    public long Drv { get; set; }
    public DateTime GpsT { get; set; }
    public bool Ignition { get; set; }
    public bool IsValid { get; set; }
    public int Lat { get; set; }
    public int Lon { get; set; }
    public int Mil { get; set; }
    public byte Rsn { get; set; }
    public byte SA { get; set; }
    public bool Shock { get; set; }
    public float Spd { get; set; }
    public DateTime Time { get; set; }
    public long Unit { get; set; }
    public bool Unlock { get; set; }
  }

  public class PosMsgDto
  {
    public int ID { get; set; }
    public DateTime GpsTimestamp { get; set; }
    public int Lat { get; set; }
    public int Lng { get; set; }
    public int Milage { get; set; }
    public long Unit { get; set; }
  }
}
