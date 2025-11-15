using Core;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository productRepo) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts(string? brand, string? type, string? sort)
    {
        return Ok(await productRepo.GetProductsAsync(brand, type,sort));
    }

    [HttpGet("{id:int}")] //api/product/1
    public async Task<ActionResult<Product>> GetProducts(int id)
    {
        var product = await productRepo.GetProductByIdAsync(id);

        if (product == null) return NotFound();

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        productRepo.AddProduct(product);

        if (await productRepo.SaveChangesAsync())
        {
            return CreatedAtAction("GetProducts", new { id = product.Id }, product);
        }

        return BadRequest("Problem creating product");
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (product.Id != id || !ProductExists(id))
            BadRequest("cannot update the product");

        productRepo.UpdateProduct(product);

        if (await productRepo.SaveChangesAsync())
        {
            return NoContent();
        }

        return BadRequest("Problem updating the products");
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await productRepo.GetProductByIdAsync(id);

        if (product == null) return NotFound();

        productRepo.DeleteProduct(product);

        if (await productRepo.SaveChangesAsync())
        {
            return NoContent();
        }

        return BadRequest("Problem deleting the products");

    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        return Ok(await productRepo.GetBrandAsync());
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        return Ok(await productRepo.GetTypesAsync());
    }

    private bool ProductExists(int id)
    {
        return productRepo.ProductExists(id);
    }
}