package com.love.proposal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;

@Controller
public class ProposalController {

    @GetMapping("/")
    public String showProposalPage(
            @RequestParam(name = "to", required = false, defaultValue = "My Love") String herName,
            @RequestParam(name = "from", required = false, defaultValue = "Forever Yours") String yourName,
            Model model) {

        model.addAttribute("herName", herName);
        model.addAttribute("yourName", yourName);

        // Story chapters data
        List<StoryChapter> chapters = Arrays.asList(
            new StoryChapter(
                1,
                "The First Moment",
                "The day our paths crossed, my whole universe shifted into color. Every laugh, every glance with you felt like destiny.",
                "/images/her/photo1.jpeg",
                "Turn The Page 💕",
                "Where our story began..."
            ),
            new StoryChapter(
                2,
                "Your Enchanting Smile",
                "You have this gentle magic that lights up even my darkest days. Just one smile from you makes all worries disappear.",
                "/images/her/photo2.jpeg",
                "Unlock A Secret Thought 🌸",
                "The smile I fell in love with..."
            ),
            new StoryChapter(
                3,
                "Our Sweetest Memories",
                "Every adventure, every quiet moment, every whispered secret — with you, even ordinary days become unforgettable adventures.",
                "/images/her/photo3.jpeg",
                "One Last Question... 💖",
                "Forever etched in my heart..."
            ),
            new StoryChapter(
                4,
                "Forever & Always",
                "You are my today, my tomorrow, and my forever. There is nobody else in this world I'd rather spend my life with.",
                "/images/her/photo4.jpeg",
                "Will You Be Mine Forever? 💍",
                "A question from the depths of my heart..."
            )
        );

        model.addAttribute("chapters", chapters);
        return "proposal";
    }

    public static class StoryChapter {
        private int step;
        private String title;
        private String description;
        private String imagePath;
        private String buttonText;
        private String tag;

        public StoryChapter(int step, String title, String description, String imagePath, String buttonText, String tag) {
            this.step = step;
            this.title = title;
            this.description = description;
            this.imagePath = imagePath;
            this.buttonText = buttonText;
            this.tag = tag;
        }

        public int getStep() { return step; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getImagePath() { return imagePath; }
        public String getButtonText() { return buttonText; }
        public String getTag() { return tag; }
    }
}
