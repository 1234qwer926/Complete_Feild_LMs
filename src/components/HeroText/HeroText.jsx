// HeroText.jsx (Adapted for PULSE Pharma LMS with updated title)
import { Button, Container, Text, Title } from "@mantine/core";
import { Dots } from "./Dots";
import classes from "./HeroText.module.css";

export function HeroText() {
  return (
    <Container className={classes.wrapper} size={1400}>
      <Dots className={classes.dots} style={{ left: 0, top: 0 }} />
      <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
      <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
      <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          AI-Automated{" "}
          <Text component="span" className={classes.highlight} inherit>
            Learning Management
          </Text>{" "}
          System
        </Title>

        <Container p={0} size={400}>
          <Text size="lg" c="dimmed" className={classes.description}>
            Streamline training with mapping, Jotforms, groups, and analytics
            for compliance and performance.
          </Text>
        </Container>

        <div className={classes.controls}>
          <Button
            className={classes.control}
            size="lg"
            variant="default"
            color="gray"
          >
            Explore
          </Button>
          <Button className={classes.control} size="lg">
            Start
          </Button>
        </div>
      </div>
    </Container>
  );
}
