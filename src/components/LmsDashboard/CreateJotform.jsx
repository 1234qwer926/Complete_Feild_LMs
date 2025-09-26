// CreateJotform.jsx
import {
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import classes from "../AuthenticationForm/AuthenticationForm.module.css";

export function CreateJotform(props) {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      jotformName: "",
    },

    validate: {
      jotformName: (val) =>
        val.length > 0 ? null : "Please enter a Jotform name",
    },
  });

  const handleSubmit = (values) => {
    console.log("Creating Jotform:", values);
    // Navigate to jotform builder with the form name
    navigate("/jotformbuilder", {
      state: { jotformName: values.jotformName },
    });
  };

  return (
    <Paper
      className={classes.formPaper}
      radius="md"
      p="lg"
      withBorder
      {...props}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <Text size="lg" fw={500} ta="center">
        Create Jotform
      </Text>

      <Divider label="Enter Jotform details" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            required
            label="Jotform Name"
            placeholder="Enter form name"
            value={form.values.jotformName}
            onChange={(event) =>
              form.setFieldValue("jotformName", event.currentTarget.value)
            }
            error={form.errors.jotformName && "Please enter a Jotform name"}
            radius="md"
          />
        </Stack>

        <Group justify="center" mt="xl">
          <Button type="submit" radius="xl">
            Create Form
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
