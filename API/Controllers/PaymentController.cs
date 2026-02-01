using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class PaymentController(IPaymentService paymentService, IGenericRepository<DeliveryMethod> dmRepo) : BaseAPIController
{
    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntenet(string cartId)
    {
        var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);

        if(cart == null) return BadRequest("Problem with your cart");

        return Ok(cart);
    }

    [HttpGet("delivery-method")]
    public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethod()
    {
        return Ok(await dmRepo.ListAllAsync());
    }
}