from manim import *

class TestScene(Scene):
    def construct(self):
        text = Text("ChatMath OK")
        self.play(Write(text))
        self.wait(1)