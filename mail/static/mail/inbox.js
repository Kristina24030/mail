document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // go through each email 
      emails.forEach(email => {
        console.log(emails);

        // display each element 
        const element = document.createElement('div');
        element.innerHTML = `<div class = "row border mx-2 my-1">
        <p class = "col-2 my-2" ><b>${email.sender}</b></p>
        <p class = "col-7 my-2">${email.subject}</p>
        <p class = "col my-2" >${email.timestamp}<p>
        </div>
      `;

        if (email.read) {
          element.className = 'read';  
        } else {
          element.className = 'unread';
        }

        element.addEventListener('click', function() {
            console.log('This element has been clicked!')
            view_email(email.id);
        });
        document.querySelector('#emails-view').append(element);
    });
  });
}

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // display email
    document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      document.querySelector('#email-view').innerHTML = `
      <ul class = "list-group">
        <li class="list-group-item" ><strong>From: </strong>${email.sender}</li>
        <li class="list-group-item"><strong>To: </strong>${email.recipients}</li>
        <li class="list-group-item"><strong>Subject: </strong>${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp: </strong>${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `;

      

      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      // archive and unarchive email
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
      btn_arch.className = email.archived ? "btn btn-sm btn-outline-primary" : "btn btn-sm btn-outline-primary";
      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => {load_mailbox('archive')})
      });
      document.querySelector('#email-view').append(btn_arch);

      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply"
      btn_reply.className = "btn btn-sm btn-outline-primary"
      btn_reply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if(subject.split(' ', 1)[0] != "Re:") {
          subject = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#email-view').append(btn_reply);
}); 


}
function send_email(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}