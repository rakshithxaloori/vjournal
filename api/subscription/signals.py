from django.dispatch import receiver
from django.db.models.signals import post_delete


from subscription.models import Customer
from subscription.tasks import del_customer_task


@receiver(post_delete, sender=Customer)
def post_delete_customer(sender, instance, **kwargs):
    del_customer_task.delay(instance.stripe_customer_id)
