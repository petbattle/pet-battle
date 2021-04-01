package main

# `deny` generates a set of error messages. The `msg` value is added to the set
# if the statements in the rule are true. If any of the statements are false or
# undefined, `msg` is not included in the set.
deny[msg] {
	# `input` is a global variable bound to the data sent to OPA by Kubernetes. In Rego,
	# the `.` operator selects keys from objects. If a key is missing, no error
	# is generated. The statement is just undefined.
	label := "app.kubernetes.io/name"
	not input.metadata.labels[label]

	# Construct an error message to return to the user.
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}

deny[msg] {
	label := "app.kubernetes.io/instance"
	not input.metadata.labels[label]
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}

deny[msg] {
	label := "app.kubernetes.io/version"
	not input.metadata.labels[label]
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}

deny[msg] {
	label := "app.kubernetes.io/component"
	not input.metadata.labels[label]
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}

deny[msg] {
	label := "app.kubernetes.io/part-of"
	not input.metadata.labels[label]
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}

deny[msg] {
	label := "app.kubernetes.io/managed-by"
	not input.metadata.labels[label]
	msg := sprintf("%s: does not contain all the expected k8s labels in 'metadata.labels'\n\n. Missing `%s`. \nSee: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels", [input.kind, label])
}
