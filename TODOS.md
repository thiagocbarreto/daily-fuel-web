1. Create main features:
   1. view challenge details v1
      1. create /challenges/[id] page
      2. view challenge details on page: description, start date (with day of the week), duration, challengers count, status, end date (with day of the week)
   2. share/join challenge
      1. update challenge card to get the challenge invite link (only visible to the owner)
      2. Update challenge details page to show the challenge invite link (only visible to the owner)
      3. challenge join page: /challenges/[id]/join
         1. page should be public but people can't join if they are not logged in
         2. they should be redirected to the login page if they are not logged in
         3. once logged in, they should be redirected to the challenge join page back again
         4. they will be redirected to the challenge page if they are already a member of the challenge
   3. view challenges details v2
      1. view members of the challenge
      2. view each member's logs/progress
   4. challengers
      1. see my logs
      2. confirm day completion
   5. add posthog
   6. track events
   7. give feedback on the app
   8.  ask for support on the app
   9.  challenge rules
   10. people can't complete a day after the challenge has ended
   11. people can't join a challenge after it has ended
   12. start date can't be changed if people have already joined the challenge and logged a day
