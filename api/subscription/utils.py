from subscription.models import Customer
from boss.models import BetaUser


def get_subscription_info(user):
    customer = Customer.objects.filter(user=user).first()
    payload = {
        "is_beta": BetaUser.objects.filter(email=user.email).exists(),
        "cancel_at_period_end": None,
        "current_period_end": 0,
    }
    if customer:
        payload["cancel_at_period_end"] = customer.cancel_at_period_end
        payload["current_period_end"] = customer.current_period_end

    return payload
