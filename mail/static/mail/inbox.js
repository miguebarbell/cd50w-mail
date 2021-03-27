document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').onclick = send_message;
  // document.querySelector('.email-element').addEventListener('click', () => {
  //
  // })
  // document.querySelector('#compose-form').addEventListener('submit', () => {
  //   send_message();
  // document.querySelector('#compose').onsubmit = send_message();
  // })

  // By default, load the inbox
  load_mailbox('inbox');
});


function read_message(mail_id, what, status) {
    //
    //read: boolean, means read or not
    // archive: boolean, means archived or not
    if (what === 'read') {
        fetch(`/emails/${mail_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: !status
            })
        })
        // final = `read: ${!status}`
    } else {
        // final = `archived: ${!status}`
        fetch(`/emails/${mail_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !status,
            })
        })

    }
    // load_mailbox('inbox');
    return false;

}


function reply_message (from, date, subject, message) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#message-view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = from;
    document.querySelector('#compose-subject').value = `RE: ${subject}`;
    document.querySelector('#compose-body').value = `On ${date} ${from} wrote: ${message}`;
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function open_message(email_id, mailbox) {
    fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
            document.querySelector('#emails-view').style.display = 'none'
            let div_message = document.createElement('div');
            div_message.id = 'div_message';
            let message_view = document.querySelector('#message-view');
            const tools = document.createElement('div');
            tools.classList.add("big-blue")
            const reply_icon = '<i class="icon fas fa-reply" id="reply" title="Reply"></i>';
            const go_back_icon = '<i class="icon fas fa-arrow-left" id="go-back" title="Go Back"></i>';
            const forward_icon = '<i class="icon fas fa-share" id="forward" title="Forward"></i>';
            const unread_icon = '<i class="icon fa fa-envelope-o" aria-hidden="true" id="unread-message" title="Mark as Unread"></i>';
            const archive_icon = '<i class="icon fa fa-archive" aria-hidden="true" id="archive-message" title="Send to Archive"></i>';
            const inbox_icon = '<i class="icon fa fa-inbox" aria-hidden="true" id="inbox-message" title="Send to Inbox"></i>';
            tools.innerHTML = `<p>${go_back_icon} &nbsp;&nbsp; &nbsp;${reply_icon}  &nbsp;&nbsp; &nbsp; ${unread_icon}&nbsp; ${archive_icon}  &nbsp;${inbox_icon}</p><hr>`
            message_view.appendChild(tools)
            // tools.onclick = load_mailbox(mailbox)
            // document.getElementById('go-back').onclick = load_mailbox(mailbox)

            // const body = document.querySelector('body');
            div_message.innerHTML = `<p>From: ${email.sender}</p><p>Date: ${email.timestamp}</p><hr><p>${email.body}</p><hr>`;
            message_view.appendChild(div_message);
            read_message(email_id, 'read', false);
            document.querySelector('#go-back').addEventListener('click', () => load_mailbox(mailbox));
            document.querySelector('#unread-message').addEventListener('click', () => {
                read_message(email_id, 'read', true);
                load_mailbox('inbox');
            })
            document.querySelector('#reply').addEventListener('click', () => reply_message(email.sender, email.timestamp, email.subject, email.body))
            document.querySelector('#archive-message').addEventListener('click',() => {
                read_message(email_id, 'archive', false);
                load_mailbox('archive');
            })

            document.querySelector('#inbox-message').addEventListener('click',() => {
                read_message(email_id, 'archive', true);
                load_mailbox('inbox');
            })
        })
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'block';
  document.querySelector('#message-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        // console.log(emails);
        //por cada elemento en emails, crear un <tag> y hacer un display
        emails.forEach(email => {
          let div_overview_message = document.createElement('div');
          div_overview_message.id = email.id;
          if (mailbox === 'sent') {
              const sent_icon = '<i class="fa fa-paper-plane-o" aria-hidden="true"></i>'
              div_overview_message.innerHTML = `<p>${sent_icon} To: ${email.recipients}, ${email.timestamp}, Subject: ${email.subject}</p><hr>`
              div_overview_message.classList.add("sent-message");
          } else {
              let unread
            if (email.read === false) {
                div_overview_message.classList.add("unread-message");
              unread = '<i class="fa fa-envelope-o" aria-hidden="true"></i>'
            } else {
                div_overview_message.classList.add("read-message");
              unread = '<i class="fa fa-envelope-open-o" aria-hidden="true"></i>';
            }
            div_overview_message.innerHTML = `<p>${unread} From: ${email.sender}, ${email.timestamp}, Subject: ${email.subject}</p><hr>`;
          }
            // document.querySelector('#emails-view').appendChild(div_message);
          document.querySelector('#emails-view').append(div_overview_message);
            // document.querySelector('.email-element').onclick = read_message(email.id, email.read);
            // document.querySelector(`#${email.id}`)
                div_overview_message.addEventListener('click', () =>
                    open_message(email.id, mailbox));

        });
      });
}


function send_message() {
  const to = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: to.value,
      subject: subject.value,
      body: body.value
    })
  })
      .then(response => response.json())
      .then(result => {
        // console.log(result);
        // console.log(result.status);
        load_mailbox('sent');
        // ... do something
      });
    return false;
  // load_mailbox('sent');
  // return;
}

