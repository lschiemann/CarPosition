using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace CarPosition.Model
{
  public class PositionContext: DbContext
  {
    public PositionContext(DbContextOptions options)
    : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      //given DB has a not pluralized table name for "PosMsg" data, so change ef core convention
      modelBuilder.Model.GetEntityTypes().Single().SetTableName("PosMsg");
    }

    public DbSet<PosMsg> PosMsgs { get; set; }
  }
}
