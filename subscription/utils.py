from subscription.models import Customer


BETA_USERS = []


def get_subscription_info(user):
    customer = Customer.objects.filter(user=user).first()
    payload = {
        "is_beta": user.email in BETA_USERS,
        "is_active": False,
        "current_period_end": 0,
    }
    if customer:
        payload["is_active"] = customer.is_active
        payload["current_period_end"] = customer.current_period_end

    return payload
