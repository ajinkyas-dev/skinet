using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseAPIController : ControllerBase
{
    protected async Task<ActionResult> CreatePageResult<T>(IGenericRepository<T> repo,
                         ISpecification<T> spec, int pageIndex, int pageSize) where T : BaseEntity
    {
        IReadOnlyList<T> items = await repo.ListAsync(spec);
        var count = await repo.CountAsync(spec);

        var pagination = new Pagination<Product>(
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                        count: count,
                        data: (IReadOnlyList<Product>)items);

        return Ok(pagination);

    }
}