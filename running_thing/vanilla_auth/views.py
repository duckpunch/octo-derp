from django.shortcuts import render, render_to_response
from django.core.urlresolvers import reverse
from django.core.mail import send_mail
from django.contrib.auth.models import User
from vanilla_auth.forms import UserCreationForm
from vanilla_auth.utils import make_digest_from_user

def registration_message(msg):
    return render_to_response('registration/message_with_link_home.html', { 'msg': msg })

def signup(request):
    user_form = UserCreationForm()
    if request.method == 'POST':
        user_form = UserCreationForm(request.POST)

        if user_form.is_valid():
            user = user_form.save(commit=False)
            user.is_active = False
            user.save()

            send_mail('Welcome to the running thing!',
                'Your validation url: http://{0}{1}'.format(
                    request.META['HTTP_HOST'], 
                    reverse('validate', args=[user.username, make_digest_from_user(user)])
                ),
                'hello@runningthing.almostflan.com', [user.email], fail_silently=False
            )
            return registration_message('Check your mail for a validation link')

    return render(request, 'registration/signup.html', { 'form': user_form})

def validate(request, username, digest):
    try:
        user = User.objects.get(username=username)
        if digest == make_digest_from_user(user):
            user.is_active = True
            user.save()
            return registration_message('Success!')
    except User.DoesNotExist:
        pass
    return registration_message('Your link seems broken.')
