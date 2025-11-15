using System.Text.Json;
using Core.Entities;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext storeContext)
    {
        if (!storeContext.Products.Any())
        {
            var productData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");

            var product = JsonSerializer.Deserialize<List<Product>>(productData);

            if (product == null) return;

            storeContext.Products.AddRange(product);

            await storeContext.SaveChangesAsync();
        }
    }
}