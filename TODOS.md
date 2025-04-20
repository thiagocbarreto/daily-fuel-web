1. Create main features:
   1. view challenges details v2 (habitshare-like) that everyone can see (view each member's logs/progress
      1. Create a new section below the main card that lists for each user:
         - their name
         - a calendar around the days of the challenge (create a separate component, shadcn's calendar component will help you)
         - if a given day is logged for the user, put it on color and a circle around it
   2. challengers
      1. confirm day completion
      2. remove day completion
   3. add posthog
   4. track events
   5. give feedback on the app
   6.  ask for support on the app
   7.  challenge rules
       1.  people can't complete a day after the challenge has ended
       2.  people can't join a challenge after it has ended
       3.  start date can't be changed if people have already joined the challenge and logged a day
       4.  email notifications
           1.  when challenge starts
           2.  when day is close to ending and not completed
           3.  when challenge ends
           4.  when user is added to a challenge