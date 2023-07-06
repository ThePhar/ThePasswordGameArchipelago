document.body.style.border = "5px solid red";
document.body.style.minHeight = "100vh";

// input fields
const connectionContainer = document.createElement("div");
const hostname = document.createElement("input");
const port = document.createElement("input");
const name = document.createElement("input");
const password = document.createElement("input");
const connect = document.createElement("button");
const text = document.createElement("span");

connectionContainer.style.display = "flex";
connectionContainer.style.margin = "0";
connectionContainer.style.padding = "0";
connectionContainer.style.position = "absolute";
// connectionContainer.style.width = "100vw";
connectionContainer.style.top = "8.5rem";
connectionContainer.style.right = "0";
connectionContainer.style.left = "0";
connectionContainer.style.zIndex = "99999";
connectionContainer.style.justifyContent = "center";
connectionContainer.style.gap = "1rem";
connectionContainer.append(
    text, hostname, port, name, password, connect
);

text.innerText = "AP Conn Info: ";
hostname.placeholder = "Address";
hostname.style.width = "120px";
port.placeholder = "Port";
port.style.width = "64px";
name.placeholder = "Slot Name";
name.style.width = "120px";
password.placeholder = "Password";
password.type = "password";
password.style.width = "100px";
connect.innerText = "Connect";

document.body.prepend(
    connectionContainer
);

const client = new archipelagoJS.ArchipelagoClient();
const textField = document.querySelector(".ProseMirror");
textField.setAttribute("contenteditable", "false");
textField.style.backgroundColor = "lightgray";

const label = document.querySelector(".password-label");
label.innerText = "Please connect to Archipelago";

const rules = document.getElementsByClassName("rule");
if (rules.length > 0) {
    location.reload();
}

connect.addEventListener("click", (e) => {
    e.preventDefault();
    connect.disabled = true;
    hostname.disabled = true;
    port.disabled = true;
    name.disabled = true;
    password.disabled = true;

    try {
        client.connect({
            game: "The Password Game",
            name: name.value,
            password: password.value,
            uuid: "",
            version: {
                major: 0,
                minor: 4,
                build: 2,
            },
            items_handling: archipelagoJS.ItemsHandlingFlags.LOCAL_ONLY
        }, hostname.value, parseInt(port.value), "ws")
            .then(() => {
                document.body.style.border = "5px solid lime";
                textField.setAttribute("contenteditable", "true");
                textField.style.backgroundColor = null;
                label.innerText = "Please choose a password";
                if (client.data.slotData["death_link"]) {
                    client.send({
                        cmd: archipelagoJS.CommandPacketType.CONNECT_UPDATE,
                        items_handling: archipelagoJS.ItemsHandlingFlags.LOCAL_ONLY,
                        tags: ["DeathLink"],
                    });
                }

                const ruleInterval = setInterval(() => {
                    const rules = document.getElementsByClassName("rule");
                    const completedLocations = [];
                    for (const rule of rules) {
                        const ruleName = rule.querySelector(".rule-top").innerText;
                        const ruleComplete = !rule.classList.contains("rule-error");
                        const locationId = parseInt(ruleName.match(/Rule (\d+)/)[1]) + 8008_000 - 1;

                        if (ruleComplete) {
                            completedLocations.push(locationId)
                        }
                        // console.log(ruleName, ruleComplete, completedLocations);
                    }

                    client.locations.check(...completedLocations);
                }, 1000);

                const deathInterval = setInterval(() => {
                    const deathScreen = document.querySelector(".death-screen-strip");
                    if (deathScreen && client.data.slotData["death_link"]) {
                        client.send({
                            cmd: "Bounce",
                            tags: ["DeathLink"],
                            data: {
                                time: Math.round(Date.now() / 1000),
                                source: name,
                                cause: deathScreen.innerText,
                            }
                        });

                        document.body.style.border = "5px solid red";
                        clearInterval(ruleInterval);
                        clearInterval(deathInterval);
                        clearInterval(winInterval);
                    }
                }, 1000);

                const winInterval = setInterval(() => {
                    const endScreen = document.querySelector(".end-screen");
                    if (endScreen.style.display === "none") {
                        return;
                    }

                    client.locations.check(8008_035);
                    client.updateStatus(30);
                    clearInterval(winInterval);
                    clearInterval(ruleInterval);
                    clearInterval(deathInterval);
                }, 1000);

            })
            .catch((error) => {
                alert(error);
                connect.disabled = null;
                hostname.disabled = null;
                port.disabled = null;
                name.disabled = null;
                password.disabled = null;
            })
    } catch (error) {
        connect.disabled = null;
        hostname.disabled = null;
        port.disabled = null;
        name.disabled = null;
        password.disabled = null;
        alert(error);
    }
});
