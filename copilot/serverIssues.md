So the server is still going down some time after I  start it on Plesk on my VPS. It doesn't seem to happen locally.

I can leave the ssh terminal up so we can see any debugging logs. Please add them as necesarry.

I am talking about the api-server.ts and all the related routes in my app. I only edit the ts files and then build to js and upload that to plesk and start it there. 

The  logs from plesk are in serverLogs.md

plesk zen desk conversation:

Skip to main content
Logo
Help center

How can we help you today?
 David Grimsley
Select Language​▼
Plesk Requests
Request #95834748

Node API keeps not staying alive
Avatar
David Grimsley
November 6, 2025
Hello Plesk Support Team,

I'm experiencing stability issues with my Node.js API server hosted on Plesk. The server intermittently becomes unresponsive and requires manual restarts.

Server Details:
- Application: Node.js/Express API server
- Database: PostgreSQL (Supabase connection pooler)
- Framework: Express.js with TypeScript
- Entry Point: server.ts (compiled to JavaScript)

Issues Observed:
1. The server process stops responding after varying periods of uptime
2. No automatic recovery - requires manual restart via Plesk SSH
3. Unclear if process is crashing or hanging
4. Database connections may be timing out

Questions:
1. Does Plesk provide application logs showing why the Node.js process stops? If so, where can I access them?
2. Is there a process manager (like PM2) enabled for Node.js applications, or do I need to configure one?
3. What are the memory and CPU limits for my hosting plan, and could resource constraints be causing the crashes?
4. Are there any automatic restart policies I can enable for Node.js applications?
5. Can you check if there are any system-level errors (OOM killer, resource limits) affecting my application?
6. What monitoring tools does Plesk provide to track Node.js application health?

Current Configuration Issues I'm Addressing:
- Adding PM2 process manager for automatic restarts
- Implementing better error handling and logging
- Adjusting database connection pool settings
- Adding graceful shutdown handlers

Any logs, error messages, or diagnostic information you can provide would be extremely helpful in resolving this issue.

Thank you for your assistance!

Best regards,
David Grimsley

P.S. I don't understand what the restart app button does in the node.js section of the app. I've always wondered. Could you tell me?

I am talking about api.pokepages.app which is used by pokepages.app. I'm not sure if this is the best setup but it's the one I have that works(most of the time).

https://github.com/DavidJGrimsley/PokePages

That is the repo for this code if that helps!

Avatar
Integrator
November 7, 2025
Hello David,

This is Elvis Plesky, your AI assistant.

Thank you for providing detailed information about your Node.js API server issues. Here are the answers to your questions:

Application Logs: Plesk does provide application logs. You can access them by logging into the Plesk GUI, navigating to Domains > example.com > Node.js, and checking the logs there.

Process Manager: Plesk does not come with a process manager like PM2 pre-installed. You will need to configure one yourself. PM2 is a good choice for managing Node.js applications and ensuring they restart automatically on crashes.

Memory and CPU Limits: The memory and CPU limits depend on your specific hosting plan. You can check these limits in your hosting plan details or by contacting your hosting provider.

Automatic Restart Policies: Plesk does not have built-in automatic restart policies for Node.js applications. Using a process manager like PM2 will help you achieve automatic restarts.

System-Level Errors: To check for system-level errors such as OOM killer or resource limits, you can review the system logs. These logs can be accessed via SSH in the /var/log directory.

Monitoring Tools: Plesk provides basic monitoring tools, but for more detailed monitoring, you might want to use external tools like New Relic or Datadog.

Regarding the Restart App button in the Node.js section, it is used to restart your Node.js application. This can be useful if you have made changes to your application and need to restart it to apply those changes.

If the above solution doesn't work, just let me know and I'll send your request to the Plesk Support Team.

Thanks,
Elvis Plesky

--

Avatar
David Grimsley
November 8, 2025
Yes I want to talk to a human. If I wanted AI then I would have hit the chat button. What's the point in giving me the option if you're just going to force me to use the AI?

Avatar
Matias Steccanella
November 8, 2025
Hello,
 
Thanks for reaching out to us, this ticket has arrived into our human queue now.
 
Since the ticket was marked to share server access, I tried taking a look from its end however I'm being asked for a password for the plesk_support user, when access should be granted via SSH key instead:

        
        
plesk_support@108.175.12.95's password:
Could you please re-check it as instructed in:
How to provide Plesk Support with server access?
 
We'll be pending on your update,
Best regards
Matias Steccanella
Technical Support Engineer
Plesk

Avatar
David Grimsley
November 8, 2025
I literally just did this yesterday when I submitted it. every time I have to redo it. I don't know why it won't work consistently.

also whenever I click the ‘support ssh access extension’, I'm hit with this: 
"Dangerous site

Attackers on the site you tried visiting might trick you into installing software or revealing things like your passwords, phone, or credit card numbers. Chrome strongly recommends going back to safety. Learn more about this warning

Turn on enhanced protection to get Chrome's highest level of security"

is that normal?

I've just enabled it again but I don't understand why it wasn't working for you. Sorry about that.

Also Plesky told me that php isn't enabled by default but I'm pretty sure I was told the opposite before. Thanks for your help in advance.

Avatar
Matias Steccanella
November 8, 2025
Hello,
 
Thanks for reviewing the access for us, it works now.
 
Regarding the Support SSH extension, access is automatically revoked after a certain period of time, and the SSH key is removed; that's most-likely the reason why we were being asked for a password but works now that it was added again.
 
Also, I did not face browser warnings while checking on it.
Are you using this very same URL?:


 
Checking on the application, I've faced this the first time I tried browsing it:


And retrieved the following error logs from /var/log/passenger/passenger.log:

        
        
App 74694 output: node:internal/url:827
App 74694 output:       href = bindingUrl.parse(input, base, true);
App 74694 output:                         ^
App 74694 output:
App 74694 output: TypeError: Invalid URL
App 74694 output:     at new URL (node:internal/url:827:25)
App 74694 output:     at parseUrl (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:544:18)
App 74694 output:     at parseOptions (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:436:30)
App 74694 output:     at Postgres (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:50:19)
App 74694 output:     at file:///var/www/vhosts/pokepages.app/server/src/db/index.js:11:23
App 74694 output:     at ModuleJobSync.runSync (node:internal/modules/esm/module_job:454:37)
App 74694 output:     at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:435:47)
App 74694 output:     at loadESMFromCJS (node:internal/modules/cjs/loader:1537:24)
App 74694 output:     at Module._compile (node:internal/modules/cjs/loader:1688:5)
App 74694 output:     at Object..js (node:internal/modules/cjs/loader:1839:10) {
App 74694 output:   code: 'ERR_INVALID_URL',
App 74694 output:   input: '"postgresql://postgres.dawyzutpbpedqqcnmfzd:hack7ppdbthis@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify&pgbouncer=true"'
App 74694 output: }
App 74694 output:
App 74694 output: Node.js v22.21.1
[ E 2025-11-08 18:17:59.0395 4170381/T38 age/Cor/App/Implementation.cpp:218 ]: Could not spawn process for application /var/www/vhosts/pokepages.app/server: The application process exited prematurely.
  Error ID: 1b29ae40
  Error details saved to: /tmp/passenger-error-RemW53.html
[ E 2025-11-08 18:17:59.0438 4170381/Tb age/Cor/Con/CheckoutSession.cpp:368 ]: [Client 2-11] Cannot checkout session because a spawning error occurred. The identifier of the error is 1b29ae40. Please see earlier logs for details about the error.
App 74872 output: node:internal/url:827
App 74872 output:       href = bindingUrl.parse(input, base, true);
App 74872 output:                         ^
App 74872 output:
App 74872 output: TypeError: Invalid URL
App 74872 output:     at new URL (node:internal/url:827:25)
App 74872 output:     at parseUrl (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:544:18)
App 74872 output:     at parseOptions (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:436:30)
App 74872 output:     at Postgres (file:///var/www/vhosts/pokepages.app/server/node_modules/postgres/src/index.js:50:19)
App 74872 output:     at file:///var/www/vhosts/pokepages.app/server/src/db/index.js:11:23
App 74872 output:     at ModuleJobSync.runSync (node:internal/modules/esm/module_job:454:37)
App 74872 output:     at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:435:47)
App 74872 output:     at loadESMFromCJS (node:internal/modules/cjs/loader:1537:24)
App 74872 output:     at Module._compile (node:internal/modules/cjs/loader:1688:5)
App 74872 output:     at Object..js (node:internal/modules/cjs/loader:1839:10) {
App 74872 output:   code: 'ERR_INVALID_URL',
App 74872 output:   input: '"postgresql://postgres.dawyzutpbpedqqcnmfzd:hack7ppdbthis@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify&pgbouncer=true"'
App 74872 output: }
App 74872 output:
App 74872 output: Node.js v22.21.1
[ E 2025-11-08 18:18:00.3792 4170381/T3d age/Cor/App/Implementation.cpp:218 ]: Could not spawn process for application /var/www/vhosts/pokepages.app/server: The application process exited prematurely.
  Error ID: 3898cf15
  Error details saved to: /tmp/passenger-error-WQtkAu.html

[ E 2025-11-08 18:18:00.3835 4170381/T9 age/Cor/Con/CheckoutSession.cpp:368 ]: [Client 1-12] Cannot checkout session because a spawning error occurred. The identifier of the error is 3898cf15. Please see earlier logs for details about the error.
This suggested the error came from the Custom environment variable DATABASE_URL (as was configured in Domains > api.pokepages.app Node.js on api.pokepages.app > Custom environment variables) having double quotes (") around the entire URL string.
This makes it an invalid URL format for the postgres library (or similar Node.js URL parsers).
Environment variables like DATABASE_URL should not include enclosing quotes, so I removed those from it and gave the application a restart using the "Restart App" button.
 
The JSON response I see now is a standard health check endpoint from the app, confirming that the Node.js process is now starting successfully and responding without the previous crash.
The "healthy" status and current timestamp indicate that the database URL parsing issue is resolved; no more TypeError: Invalid URL on startup:



        
        
App 80269 output: [DEBUG] legendsZATrackerQueries.ts loaded
App 80269 output: [DEBUG] legends-za/controller.ts loaded
App 80269 output: [DEBUG] legends-za/index.ts router loaded
App 80269 output: 🚀 PokePages Drizzle API server running on port 3001
App 80269 output: 📊 Health check: http://localhost:3001/test
App 80269 output: 📊 DB Connection Health check: http://localhost:3001/test-db
App 80269 output: 🎮 API endpoints:
App 80269 output:    Events: http://localhost:3001/events
App 80269 output:    AI: http://localhost:3001/ai
App 80269 output:    Profiles: http://localhost:3001/profiles
App 80269 output:    Legends Z-A Tracker: http://localhost:3001/legends-za
App 80269 output: legendsZARouter router loaded: function
 
Kindly note our technical support relates to the issues of Plesk itself and its components; while issues which are specific to the hosted websites and/or applications due to their configuration/setups rely on customer's behalf.
 
In regards of your initial queries:
 
Yes, Plesk does captures logs for Node.js applications.
The stdout/stderr from apps and they are typically routed to the domain's error log, which is managed by Apache/Nginx via Phusion Passenger.
You can check on them via via Domains > api.pokepages.app > Logs and/or for a more verbose Passenger-specific log (like the ones I shared above) you can look over from /var/log/passenger/passenger.log.
Some error details are also temporarily saved in files like /tmp/passenger-error-*.html (as pointed in the example above):

        
        
Error details saved to: /tmp/passenger-error-RemW53.html

        
        
Error details saved to: /tmp/passenger-error-WQtkAu.html
 
By default, Plesk uses Phusion Passenger as the process manager for Node.js apps.
It automatically spawns and manages processes, attempting restarts on failures.
However, if the app crashes immediately on startup (as was the case due to the configuration error I've fixed), Passenger will log the failure but won't keep retrying indefinitely to avoid resource loops.
That being said, Node.js library "pm2" is not officially supported by Plesk and has not been properly tested.
You may try to Install it on the server at your own risk and will via Domains > api.pokepages.app > Node.js > Run Node.js commands (as example only run npm install -g pm2) yet we wouldn't be able to guarantee it will work as expected.
You could also submit this to our developers team as a feature request to be implemented in future releases of Plesk over here.
Passenger handles basic auto-restarts for running apps, and there's no built-in Plesk toggle for this beyond Passenger's defaults; so I understand you may want to integrate pm2 for for more "robust" policies.
 
Resource limits mostly depend on your specific hosting plan (shared, VPS, etc.) and hosting provider.
In the server logs I've checked, there's no evidence of resource exhaustion like OOM kills or CPU throttling; the errors were purely from the invalid URL during startup.
For an "easy" checkup, Plesk's home page has these:


Still you may want to Use Built-in Monitoring to go further into details:


 
Finally, about the "Restart App" button; it manually restarts the Node.js process managed by Passenger.
It's useful after configuration changes take place (like modifying a Custom environment variable such as a DATABASE_URL) to get them applied without restarting the entire server.
That way, it doesn't affect any other domains or services, just the app's runtime.
 
I'll appreciate your understanding on the fact that website/application specific issues are meant for customer's and developer's to handle, and that if you need any further assistance with Plesk itself, please do not hesitate and be always welcome to get back in touch with us, it will always be our pleasure to help.
 
Best regards
Matias Steccanella
Technical Support Engineer
Plesk

Avatar
David Grimsley
November 8, 2025
Ok I understand you may have found that double quotes thing but I guess the environement variables was another thing I was wondering about because they seem to be ignored. I had to upload my own .env file. But I don't see any quotes around any environment variables. is that becuase you removed them?

But here's ‘proof’ that the custom environment variables don't work or I just don't know how to use them. Please excuse any ignorance I have. I try really hard but this is all just so much to navigate. 
 



I don't quite understand how the restart button works still. Maybe it's over my head. Does it run a specific command or it's a passenger thing that's not quite node.. idk. 

also my server is now accessible at api.pokepages.app.. which it hasn't been for a while and I didn't really care cause the endpoints that matter work and I thought it was just a weird plex issue but now the endpoints that matter DON'T work, even this simple test one. 


 

After I put my .env file back in and restarted with my command prompt script then the test route and all other routes are working again. but for how long I don't know. Thank you for all your help. I understand there's only so much you can do.

Avatar
Martin Schaumburg
November 9, 2025
Hi David,
 
Regarding your question:
I don't quite understand how the restart button works still. Maybe it's over my head. Does it run a specific command or it's a passenger thing that's not quite node.. idk. 

In case of doubt, you can always enable "full" debug mode according to How to enable / disable Plesk debug mode including the show.util_exec and show.util_exec_io options, and then tail -f the file /var/log/plesk/panel.log into a separate file to make examination easier, e.g. via:

        
        
# tail -f /var/log/plesk/panel.log >> restartapplog
And then simply push the button, wait a second or two, and then terminate the above mentioned command via ctrl+c.
 So, what happens exactly would be the following:

        
        
Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/.bootstrap.cjs, stdin:
[2025-11-09 07:35:52.647] 12513:691044589ca3c DEBUG [util_exec][] [6e48142523722148f85019fc2007c714-0] Finished in 0.00515s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.647] 12513:691044589ca3c DEBUG [util_exec][] [465351cbda911ab87398e10abdb3b1ac-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/tmp, stdin:
[2025-11-09 07:35:52.650] 12513:691044589ca3c DEBUG [util_exec][] [465351cbda911ab87398e10abdb3b1ac-0] Finished in 0.00371s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.651] 12513:691044589ca3c DEBUG [util_exec][] [55beebacf3b5bbfe8fadaa8267f77e8e-0] Starting: filemng test.tld_xxbqwu664c mkdir -m0755 /var/www/vhosts/test.tld/httpdocs/tmp, stdin:
[2025-11-09 07:35:52.655] 12513:691044589ca3c DEBUG [util_exec][] [55beebacf3b5bbfe8fadaa8267f77e8e-0] Finished in 0.00467s, Error code: 0, stdout: , stderr:
[2025-11-09 07:35:52.655] 12513:691044589ca3c DEBUG [util_exec][] [ff08e29305a1d49a344c2bdf04420779-0] Starting: filemng test.tld_xxbqwu664c touch /var/www/vhosts/test.tld/httpdocs/tmp/restart.txt, stdin:
[2025-11-09 07:35:52.660] 12513:691044589ca3c DEBUG [util_exec][] [ff08e29305a1d49a344c2bdf04420779-0] Finished in 0.00454s, Error code: 0, stdout: , stderr:
[2025-11-09 07:35:52.660] 12513:691044589ca3c INFO [performance][] POST /modules/nodejs/index.php/api/restart-domain : Memory used: 4.00 MB
[2025-11-09 07:35:52.660] 12513:691044589ca3c INFO [performance][] POST /modules/nodejs/index.php/api/restart-domain : Execution Time: 0.057 sec
[2025-11-09 07:35:52.800] 12513:69104458c35d3 DEBUG [util_exec][] [b78c2f9a9e013c0ba0a3f91ded1731e2-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/yarn.lock, stdin:
[2025-11-09 07:35:52.805] 12513:69104458c35d3 DEBUG [util_exec][] [b78c2f9a9e013c0ba0a3f91ded1731e2-0] Finished in 0.00543s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.806] 12513:69104458c35d3 DEBUG [util_exec][] [3bf98b92a8317b67815b5de3e652e3a5-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/package.json, stdin:
[2025-11-09 07:35:52.811] 12513:69104458c35d3 DEBUG [util_exec][] [3bf98b92a8317b67815b5de3e652e3a5-0] Finished in 0.00448s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.811] 12513:69104458c35d3 DEBUG [util_exec][] [a37cec8cda3c1b4cf2bc69363fe323e5-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/Gruntfile.js, stdin:
[2025-11-09 07:35:52.815] 12513:69104458c35d3 DEBUG [util_exec][] [a37cec8cda3c1b4cf2bc69363fe323e5-0] Finished in 0.00428s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.815] 12513:69104458c35d3 DEBUG [util_exec][] [17fcffce0d46477367d85928ea50d0ee-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/gulpfile.js, stdin:
[2025-11-09 07:35:52.819] 12513:69104458c35d3 DEBUG [util_exec][] [17fcffce0d46477367d85928ea50d0ee-0] Finished in 0.00369s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.819] 12513:69104458c35d3 DEBUG [util_exec][] [306b9520aa0c7ae254aa859cf981350d-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/webpack.config.js, stdin:
[2025-11-09 07:35:52.823] 12513:69104458c35d3 DEBUG [util_exec][] [306b9520aa0c7ae254aa859cf981350d-0] Finished in 0.00352s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.823] 12513:69104458c35d3 DEBUG [util_exec][] [900762dbd59a888933209726576d3f74-0] Starting: filemng test.tld_xxbqwu664c file_exists /var/www/vhosts/test.tld/httpdocs/app.js, stdin:
[2025-11-09 07:35:52.826] 12513:69104458c35d3 DEBUG [util_exec][] [900762dbd59a888933209726576d3f74-0] Finished in 0.00351s, Error code: 0, stdout: 1
, stderr:
[2025-11-09 07:35:52.828] 12513:69104458c35d3 INFO [performance][] GET /modules/nodejs/index.php/api/application/domainId/1 : Memory used: 4.00 MB
[2025-11-09 07:35:52.828] 12513:69104458c35d3 INFO [performance][] GET /modules/nodejs/index.php/api/application/domainId/1 : Execution Time: 0.054 sec
 
In any case, I openend your site in a browser, and as far as I can tell, it appears to work as expected:


Which makes me believe you already found a way to resolve the issues you were facing.
Please do not hesitate to re-open this ticket if you have any additional questions or suggestions, or if there is something else we can help you with.
 
Best regards,
Martin Schaumburg

Technical Support Engineer

Plesk

This request is closed for comments. You can create a follow-up.

David Grimsley submitted this request

Status
Solved
Assigned to
Matias Steccanella
Server IP
Removed on closure
Username / Password
Removed on closure
Port
22

Logo
Product
Login
Pricing
Editions
For Partners
Partner Program
Contributor Program
Affiliate Program
Plesk University
Company
Blog
Careers
Events
About Plesk
Our Brand
Resources
User and Admin guides
Help Center
Migrate to Plesk
Contact Us
Hosting Wiki
Forum
Legal
Legal
Privacy Policy
Imprint
© 2025 WebPros International GmbH
Part of the WebPros®  Family
Return to top

