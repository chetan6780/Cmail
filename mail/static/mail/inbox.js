document.addEventListener('DOMContentLoaded', () => {
    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

// COMPOSE EMAIL ---------------------------------------------------------------
compose_email = () => {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // when you click on submit Create new mail
    document.querySelector('#submit').addEventListener('click', (e) => new_mail(e));

}

// CREATE NEW EMAIL ------------------------------------------------------------
new_mail = (e) => {
    e.preventDefault(); // prevent default behavior of submit button
    // Email data
    const recipients = document.querySelector('#compose-recipients')
    const sender = document.querySelector('#compose-sender')
    const subject = document.querySelector('#compose-subject')
    const body = document.querySelector('#compose-body')

    // Create alert for empty input
    const alert = document.querySelector("#message");
    if (subject.value.length < 1 || body.value.length < 1) {
        alert.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <strong>Error!</strong> subject and body are required.
        </div>`;
        // fade alert after 1.5 Seconds
        setTimeout(() => {
            alert.innerHTML = "";
        }, 1500);
        return;
    }
    // if recipients and sender are same the show error message
    if (recipients.value === sender.value) {
        alert.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <strong>Error!</strong> sender and recipient can't be same.
        </div>`;
        return;
    }

    // Request-1:POST , Route:/emails , Create new email
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients.value,
            subject: subject.value,
            body: body.value,
            read: true
        })
    })
        .then(response => response.json())
        .then((result) => {

            // If email sent successfully, show success message and go to sent mailbox
            if (result.status == 201) {
                alert.innerHTML = `
            <div class="alert alert-success" role="alert">
            <strong>Success!</strong> ${result.message}
            </div> `;
                setTimeout(() => {
                    alert.innerHTML = "";
                    load_mailbox("sent");
                }, 1500);
            } else { // Else show the error message
                alert.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Error!</strong> ${result.error}
            </div> `;
                setTimeout(() => {
                    alert.innerHTML = "";
                }, 1500);
            }
        });
}

// LOAD PERTICULAR MAILBOX -----------------------------------------------------
load_mailbox = (mailbox) => {
    // Request-2:GET , Route:/emails/${mailbox}, Load perticular mailbox
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach((element) => {
                // Add read class
                let email__read = "unread";
                if (mailbox === "inbox") {
                    if (element.read === false) email__read = "read";
                }

                // Create new card item
                const card_item = document.createElement("div");
                card_item.className = `card mt-1 ${email__read} items`;
                card_item.innerHTML = `      
                <div class="card-body" id="item-${element.id}">
                    <div class="row">
                        <div class="card-title font-weight-bold col-md-2 col-12"> ${element.subject.slice(0, 15)}</div>
                        <div class="card-text col-md-7 col-12"> ${element.body.slice(0, 65)}...</div>
                        <div class="col-md-3 col-12 d-flex align-right text-muted">${element.timestamp}</div>
                    </div>
                </div>`;
                // Append card item to email view
                document.querySelector("#emails-view").appendChild(card_item);

                // When clicked show the individual email
                card_item.addEventListener("click", () => {
                    individual_mail(element.id, mailbox)
                });
            })
        });

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><hr>`;
}

// SHOW INDIVIDUAL EMAIL ------------------------------------------------------------
individual_mail = (id, mailbox) => {
    // Request-3:GET , Route:/emails/<int:email_id>, Load individual mail
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {

            let arc_toggle = "Archive";
            if (email.archived === true) { arc_toggle = "Unarchive"; }

            // Create individual email item 
            let buttons = `<button class="btn btn-outline-primary" id="archive">${arc_toggle}</button>
                            <button class="btn btn-outline-primary" id="reply">Reply</button>`;

            if (mailbox === "sent") {
                buttons = `<button class="btn btn-outline-primary" id="reply">Reply</button>`;
            }

            let from_to = `
            <div class="col-9">
                <b>From: ${email.sender}</b><br>
                <b>To: ${email.recipients}</b><br>
            </div>`;
            if (mailbox === "inbox") {
                from_to = `
                <div class="col-9"><b>${email.sender}</b><br>
                    <p class="text-muted">To me</p>
                </div>`
            }
            else if (mailbox === "sent") {
                from_to = `
                <div class="col-9"><b>To: ${email.recipients}</b><br><br>
            </div>`
            }

            const indv_email = `
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title">${email.subject}</h3>
                    <hr>
                    <div class="row">
                        ${from_to}
                        <div class="col-12 col-md-3 text-muted">${email.timestamp}
                        </div>
                    </div>
                    <hr class="mt-0">
                    <p class="card-text">
                        ${email.body}
                    </p>${buttons}
                </div>
            </div>`;

            // Show individual email in emails view
            document.querySelector('#emails-view').innerHTML = indv_email;

            // toggle archive
            if (mailbox !== "sent") {
                const elem = document.querySelector("#archive");
                elem.addEventListener("click", () => {
                    if (elem.innerHTML === "Archive") {
                        elem.innerHTML = "Unarchive";
                        archive_toggle(id, true);
                    } else {
                        elem.innerHTML = "Archive";
                        archive_toggle(id, false);
                    }
                });
            }

            // Reply to the mail
            document.querySelector('#reply').addEventListener('click', () => reply_mail(email.sender, email.subject, email.body, email.timestamp));
        });

    // Request-4:PUT , Route:/emails/<int:email_id>, mark mail as read
    // Mark as read
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })

}

// ARCHIVE/UNARCHIVE TOGGLE -----------------------------------------------------
archive_toggle = (id, mode) => {
    // Request-4:PUT , Route:/emails/<int:email_id>, toggle archive of a mail
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: mode
        })
    })
}

reply_mail = (sender, subject, body, timestamp) => {
    compose_email();
    if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
    let content = `On ${timestamp} by <b>${sender},</b> wrote:<br>${body}<br><hr>`;

    document.querySelector("#compose-recipients").value = sender;
    document.querySelector("#compose-subject").value = subject;
    document.querySelector("#compose-body").value = content;
}
