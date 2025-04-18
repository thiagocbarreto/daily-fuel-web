1. Create main features:
   1. share/join challenge
      1. update challenge card to get the challenge invite link (icon button, only visible to the owner)
      2. Update challenge details page to show the challenge invite link (only visible to the owner)
      3. challenge join page: /challenges/[id]/join
         1. page should be public but people can't join if they are not logged in
         2. they should be redirected to the login page if they are not logged in
         3. once logged in, they should be redirected to the challenge join page back again
         4. they will be redirected to the challenge page if they are already a member of the challenge
         5. once they join the challenge, they will be redirected to the challenge page + they should be added to the challenge participants list
   2. view challenges details v2
      1. view members of the challenge
      2. view each member's logs/progress
   3. challengers
      1. see my logs
      2. confirm day completion
   4. add posthog
   5. track events
   6. give feedback on the app
   7.  ask for support on the app
   8.  challenge rules
   9.  people can't complete a day after the challenge has ended
   10. people can't join a challenge after it has ended
   11. start date can't be changed if people have already joined the challenge and logged a day
