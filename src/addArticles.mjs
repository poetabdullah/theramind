import { db } from "./firebaseConfig.js"; // ✅ Use `import` instead of `require`
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const addArticles = async () => {
  try {
    await addDoc(collection(db, "articles"), {
      author_name: "Dr. Patel",
      author_email: "admin@example.com", // Placeholder email
      content: `
        <h2>Asking for Help: Getting Past Obstacles</h2>
        <p>When we're struggling with something, it's natural to turn to others for help. Helping each other is all part of the giving and receiving that makes up good relationships.</p>

        <p>Getting help sounds simple. But it's not always easy to do. Sometimes we stand in our own way without realizing it.</p>

        <p>Certain beliefs or ways of thinking can make it hard to see opportunities for help. Here are some examples of the kinds of attitudes that can stand in the way — and ideas on how to get past them.</p>

        <h3>Obstacle 1: Believing That Needing Help Is a Sign of Weakness</h3>
        <p>Asking for help shows maturity and confidence. It's a sign of strength, not weakness. You know what you need and you're not afraid to reach out for it.</p>

        <blockquote>
          <p><strong>Instead of thinking:</strong> "I don't want my coach to find out I can't nail that move in case he thinks I shouldn't be on the team."</p>
          <p><strong>Change it to:</strong> "I'll show my coach how committed I am to the team — and how hard I practice — by asking him to share tips on how I can improve."</p>
        </blockquote>

        <h3>Obstacle 2: Thinking You Don't Deserve Help or Support</h3>
        <p>Everyone needs help now and then. No one can — or should — handle everything alone. Accepting help can strengthen friendships and relationships. Everyone feels good when they can support a friend!</p>

        <blockquote>
          <p><strong>Instead of thinking:</strong> "I'd really like to find out how Katy is coping with her parents' divorce, but she's so popular and busy I'm sure she doesn't have time for me."</p>
          <p><strong>Change it to:</strong> "I'll ask Katy if she has time to talk and let her know how much her perspective means to me. Maybe some of the stuff that happened to me can help her too."</p>
        </blockquote>

        <h3>Obstacle 3: Not Speaking Up to Ask for Help</h3>
        <p>Sometimes you're lucky enough to have people in your life who see what you need and offer to help before you ask. Usually it's a parent or a close friend. But sometimes when we need help, we have to ask.</p>

        <blockquote>
          <p><strong>Instead of thinking:</strong> "I'm afraid my friends won't want to hear that my boyfriend pushed me — they already think I'm ignoring their advice about him being too controlling. And I don't want to worry my mom. So I'll just keep this to myself for now."</p>
          <p><strong>Change it to:</strong> "I'll tell my friends they were right and I'm starting to worry about my boyfriend's behavior. I'll ask them to help me figure out what to do and how to tell my mom."</p>
        </blockquote>

        <h3>Obstacle 4: Waiting for Someone Else to Make the First Move</h3>
        <p>It's not always easy for other people to see when we need help. Maybe we're putting on a cheerful face to mask the problem or giving off a vibe that we don't want to talk. Don't wait for someone to read your mind or notice what you need. Ask.</p>

        <blockquote>
          <p><strong>Instead of thinking:</strong> "I really wish Shanya would ask about the scars on my leg so I can talk to someone about my cutting. I know she suspects, but maybe she doesn't really care."</p>
          <p><strong>Change it to:</strong> "I'll tell Shanya what's going on and say I could really use some help."</p>
        </blockquote>

        <h3>Obstacle 5: Giving Up Too Easily</h3>
        <p>If help doesn't get us what we expect right away, it's tempting to give up. But getting help takes ongoing effort. It might take multiple attempts.</p>

        <blockquote>
          <p><strong>Instead of thinking:</strong> "You'd think the college prep advisor would know right away what's best for me! He's supposed to have all this experience, but now that I've met him I wonder if it's all just a big waste of time."</p>
          <p><strong>Change it to:</strong> "My first meeting with the college prep advisor was a little disappointing. But it will probably take him some time to get to know my personality and which college is the best fit. I'll give it two more meetings before I make a decision."</p>
        </blockquote>

        <h3>Why Asking for Help Is Important</h3>
        <p>None of us can go it alone. The people who believe in us remind us that we have what it takes, that we matter, and that we're loved. But sometimes we just have to reach out and ask for that help.</p>

        <p>Because it can be hard to reach out for help, don't hesitate to reach out and offer support to another person if you think he or she needs it.</p>

        <p><strong>Source:</strong> <a href="https://kidshealth.org/en/teens/help-obstacles.html">KidsHealth</a></p>
      `,
      date_time: serverTimestamp(),
      last_updated: new Date(),
      selectedTags: { 0: "Mental Health" },
      title: "Asking for Help: Getting Past Obstacles",
      user_id: "admin",
    });

    console.log("Article added successfully!");
  } catch (error) {
    console.error("Error adding article:", error);
  }
};

addArticles();
